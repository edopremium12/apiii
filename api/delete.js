export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'DELETE') return res.status(405).json({ status: false, message: 'Harus DELETE method.' });

    const authHeader = req.headers.authorization;
    const tokenInput = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (tokenInput !== process.env.KEY_UNLIMITED && tokenInput !== process.env.KEY_LIMITED) {
        return res.status(401).json({ status: false, message: 'Akses Ditolak!' });
    }

    const { folder, filename } = req.body;
    if (!folder || !filename) return res.status(400).json({ status: false, message: 'Parameter "folder" dan "filename" wajib!' });

    const username = process.env.GITHUB_USERNAME;
    const repoName = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;
    const filePath = `${folder}/${filename}`;

    try {
        const getFile = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!getFile.ok) return res.status(404).json({ status: false, message: 'File tidak ditemukan.' });
        
        const fileData = await getFile.json();
        const deleteReq = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `Hapus ${filename}`, sha: fileData.sha })
        });

        if (deleteReq.ok) return res.status(200).json({ status: true, message: `File ${filename} dihapus.` });
        return res.status(500).json({ status: false, message: 'Gagal menghapus.' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Server Error', error: error.message });
    }
}
