export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ status: false, message: 'Harus GET method.' });

    const authHeader = req.headers.authorization;
    const tokenInput = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (tokenInput !== process.env.KEY_UNLIMITED && tokenInput !== process.env.KEY_LIMITED) {
        return res.status(401).json({ status: false, message: 'Akses Ditolak!' });
    }

    const username = process.env.GITHUB_USERNAME;
    const repoName = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    try {
        const rootCheck = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!rootCheck.ok) return res.status(404).json({ status: false, message: 'Database belum siap.' });

        const rootData = await rootCheck.json();
        const uploadFolders = rootData.filter(item => item.name.startsWith('uploads_v') && item.type === 'dir');
        
        let totalFiles = 0;
        let folderStats = [];

        for (const folder of uploadFolders) {
            const folderContent = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${folder.name}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const files = await folderContent.json();
            const fileCount = Array.isArray(files) ? files.length : 0;
            totalFiles += fileCount;
            folderStats.push({ folder: folder.name, files: fileCount });
        }

        return res.status(200).json({ status: true, repo: `${username}/${repoName}`, total_folders: uploadFolders.length, total_files: totalFiles, details: folderStats });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Server Error', error: error.message });
    }
}
