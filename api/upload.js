export default async function handler(req, res) {
    // 0. Handle CORS Preflight
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ status: false, message: 'Harus POST method.' });

    // 1. KEAMANAN & ROLE API KEY
    const authHeader = req.headers.authorization;
    const tokenInput = authHeader ? authHeader.replace('Bearer ', '') : null;

    const keyLimited = process.env.KEY_LIMITED;     // Dari Vercel ENV
    const keyUnlimited = process.env.KEY_UNLIMITED; // Dari Vercel ENV

    let isLimited = false;

    if (tokenInput === keyLimited) {
        isLimited = true;
    } else if (tokenInput !== keyUnlimited) {
        return res.status(401).json({ status: false, message: 'Akses Ditolak: API Key tidak valid!' });
    }

    const { base64, ext = 'jpg' } = req.body; 
    if (!base64) return res.status(400).json({ status: false, message: 'Parameter "base64" wajib dikirim!' });

    // 2. LIMIT UKURAN (4.5 MB)
    const sizeInBytes = Math.ceil((base64.length * 3) / 4);
    const maxSize = 4.5 * 1024 * 1024; // 4.5 MB
    if (sizeInBytes > maxSize) {
        return res.status(413).json({ status: false, message: 'File kebesaran! Maksimal 4.5 MB.' });
    }

    const token = process.env.GITHUB_TOKEN;
    const username = process.env.GITHUB_USERNAME;
    const repoName = process.env.GITHUB_REPO;

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Bella-Cloudy-Ultimate'
    };

    const fetchGit = async (path, method = 'GET', body = null) => {
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);
        return await fetch(`https://api.github.com/${path}`, options);
    };

    try {
        // 3. CEK KUOTA (Khusus pengguna KEY_LIMITED)
        let limitSha = null;
        let currentUsage = 0;

        if (isLimited) {
            const checkLimit = await fetchGit(`repos/${username}/${repoName}/contents/limits.json`);
            if (checkLimit.ok) {
                const limitData = await checkLimit.json();
                limitSha = limitData.sha;
                const limitContent = Buffer.from(limitData.content, 'base64').toString('utf-8');
                currentUsage = JSON.parse(limitContent).usage || 0;
            }
            if (currentUsage >= 100) {
                return res.status(429).json({ status: false, message: 'Limit upload API Key kamu sudah habis (Maks 100). Hubungi Edo.' });
            }
        }

        // 4. AUTO-FOLDER VERSIONING
        let currentVersion = 1;
        let targetFolder = `uploads_v${currentVersion}`;
        let rootCheck = await fetchGit(`repos/${username}/${repoName}/contents/`);
        
        if (rootCheck.status === 404 || rootCheck.status === 409) {
            await fetchGit('user/repos', 'POST', { name: repoName, private: false, auto_init: true });
            await new Promise(resolve => setTimeout(resolve, 3500));
        } else if (rootCheck.ok) {
            const rootData = await rootCheck.json();
            if (Array.isArray(rootData)) {
                const uploadFolders = rootData.filter(item => item.name.startsWith('uploads_v') && item.type === 'dir');
                if (uploadFolders.length > 0) {
                    const versions = uploadFolders.map(f => parseInt(f.name.replace('uploads_v', ''))).filter(n => !isNaN(n));
                    currentVersion = Math.max(...versions);
                    targetFolder = `uploads_v${currentVersion}`;
                }
            }
        }

        // Cek limit isi folder (Maks 100 file)
        let folderCheck = await fetchGit(`repos/${username}/${repoName}/contents/${targetFolder}`);
        if (folderCheck.ok) {
            const folderData = await folderCheck.json();
            if (Array.isArray(folderData) && folderData.length >= 100) {
                currentVersion++;
                targetFolder = `uploads_v${currentVersion}`;
            }
        }

        // 5. PENAMAAN FILE (edoajaXXXXXX.ext)
        const randomId = Math.floor(Math.random() * 900000) + 100000; 
        const cleanExt = ext.replace('.', '');
        const uniqueFilename = `edoaja${randomId}.${cleanExt}`;
        const filePath = `${targetFolder}/${uniqueFilename}`;

        // 6. UPLOAD KE GITHUB
        const uploadResponse = await fetchGit(`repos/${username}/${repoName}/contents/${filePath}`, 'PUT', {
            message: `Upload ${uniqueFilename}`,
            content: base64
        });

        const uploadData = await uploadResponse.json();

        if (uploadData.content && uploadData.content.download_url) {
            // 7. POTONG LIMIT JIKA PAKAI KEY LIMITED
            if (isLimited) {
                const newLimitData = { usage: currentUsage + 1 };
                const limitBody = {
                    message: `Update usage: ${currentUsage + 1}`,
                    content: Buffer.from(JSON.stringify(newLimitData)).toString('base64')
                };
                if (limitSha) limitBody.sha = limitSha;
                await fetchGit(`repos/${username}/${repoName}/contents/limits.json`, 'PUT', limitBody);
            }

            const vercelDomain = req.headers.host; 
            const cleanUrl = `https://${vercelDomain}/file/${targetFolder}/${uniqueFilename}`;
            
            return res.status(200).json({ 
                status: true, 
                message: "Upload Sukses",
                size: `${(sizeInBytes / 1024 / 1024).toFixed(2)} MB`,
                role: isLimited ? `Limited Key (Sisa Kuota: ${99 - currentUsage})` : 'Unlimited Key (Admin)',
                filename: uniqueFilename,
                url: cleanUrl 
            });
        } else {
            return res.status(500).json({ status: false, message: 'Gagal upload', error: uploadData });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Server Error', error: error.message });
    }
}
