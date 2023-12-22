import express, { Router,Request, Response } from 'express';
const router: Router = express.Router();

router.get('/hey',async (req:Request,res:Response) => {
    res.send('hello from router!');
});

export default router;