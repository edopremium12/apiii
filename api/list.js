export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ status: false, message: 'Harus GET method.' });

    const authHeader = req.headers.authorization;
    const tokenInput = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (tokenInput !== process.env.KEY_UNLIMITED && tokenInput !== process.env.KEY_LIMITED) {
        return res.status(401).json({ status: false, message: 'Akses Ditolak!' });
    }

    const { folder } = req.query;
    if (!folder) return res.status(400).json({ status: false, message: 'Parameter query ?folder= nama_folder wajib ada!' });

    const username = process.env.GITHUB_USERNAME;
    const repoName = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    try {
        const getFolder = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${folder}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!getFolder.ok) return res.status(404).json({ status: false, message: 'Folder tidak ditemukan.' });
        
        const folderData = await getFolder.json();
        const files = folderData.map(file => ({ name: file.name, size: `${(file.size / 1024).toFixed(2)} KB` }));

        return res.status(200).json({ status: true, folder: folder, total_files: files.length, files: files });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Server Error', error: error.message });
    }
}
