// Progress tracking endpoint for real-time updates
let progressStore = new Map();

export default async function handler(req, res) {
  const { jobId } = req.query;
  
  if (req.method === 'GET') {
    const progress = progressStore.get(jobId) || { 
      progress: 0, 
      status: 'not_found',
      message: 'Job not found' 
    };
    
    res.json(progress);
  } else if (req.method === 'POST') {
    const { progress, status, message } = req.body;
    
    progressStore.set(jobId, {
      progress,
      status,
      message,
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export { progressStore };
