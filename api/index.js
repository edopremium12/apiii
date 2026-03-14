export default function handler(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
    <!DOCTYPE html>
    <html lang="id" class="dark">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bella Cloudy | Ultimate API</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@300;500;700&display=swap');
            body { font-family: 'Inter', sans-serif; background: #0f172a; background-image: radial-gradient(circle at top right, #1e293b, #0f172a); color: #f8fafc; min-height: 100vh; }
            .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(51, 65, 85, 0.5); border-radius: 1rem; }
            code, pre { font-family: 'Fira Code', monospace; }
        </style>
    </head>
    <body class="p-6 md:p-12">
        <div class="max-w-4xl mx-auto">
            <div class="text-center mb-12">
                <h1 class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                    <i class="fa-solid fa-cloud-bolt mr-2"></i>Bella Cloudy API
                </h1>
                <p class="text-slate-400 font-medium">Ultimate Storage Engine v5.0 | Coded by Edo Pratama</p>
            </div>

            <div class="grid gap-6">
                <div class="glass-card p-6 shadow-xl">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="bg-blue-500 text-white px-3 py-1 rounded text-sm font-bold shadow-lg shadow-blue-500/30">POST</span>
                        <code class="text-cyan-300 text-lg">/api/upload</code>
                    </div>
                    <p class="text-slate-300 mb-4 text-sm">Upload semua format file (Maks 4.5MB). Membutuhkan Bearer Token. Limit diatur berdasarkan Role API Key.</p>
                    <div class="bg-slate-900 rounded-lg p-4 text-sm text-green-400 overflow-x-auto">
                        Headers: { "Authorization": "Bearer KEY_RAHASIA" }<br>
                        Body JSON: { "base64": "...", "ext": "mp4" }
                    </div>
                </div>

                <div class="glass-card p-6 shadow-xl">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold shadow-lg shadow-red-500/30">DELETE</span>
                        <code class="text-red-300 text-lg">/api/delete</code>
                    </div>
                    <p class="text-slate-300 mb-4 text-sm">Menghapus file dari database GitHub.</p>
                    <div class="bg-slate-900 rounded-lg p-4 text-sm text-green-400 overflow-x-auto">
                        Headers: { "Authorization": "Bearer KEY_RAHASIA" }<br>
                        Body JSON: { "folder": "uploads_v1", "filename": "edoaja123.jpg" }
                    </div>
                </div>

                <div class="glass-card p-6 shadow-xl">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="bg-emerald-500 text-white px-3 py-1 rounded text-sm font-bold shadow-lg shadow-emerald-500/30">GET</span>
                        <code class="text-emerald-300 text-lg">/api/list?folder=uploads_v1</code>
                    </div>
                    <p class="text-slate-300 mb-4 text-sm">Melihat isi folder. Membutuhkan Bearer Token.</p>
                </div>
                
                <div class="glass-card p-6 shadow-xl">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold shadow-lg shadow-purple-500/30">GET</span>
                        <code class="text-purple-300 text-lg">/api/stats</code>
                    </div>
                    <p class="text-slate-300 mb-4 text-sm">Melihat total file dan statistik penyimpanan.</p>
                </div>
            </div>
            
            <footer class="text-center mt-12 text-slate-500 text-sm">
                <p>&copy; 2026 Bella Cloudy Project. Running on Vercel Serverless.</p>
            </footer>
        </div>
    </body>
    </html>
    `);
}
