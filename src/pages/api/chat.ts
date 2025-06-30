import type {NextApiRequest, NextApiResponse} from 'next'
import axios from 'axios'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const response = await axios.post(
        'http://localhost:3000/chat',
        req.body,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error in API request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}