import * as express from "express";
import { controller, httpGet, BaseHttpController, requestParam, httpPost, requestBody, httpDelete } from "inversify-express-utils";
import { Post } from "../models/post";
import { AuthorizeMiddleware } from "../middlewares/authorize";

@controller("/posts", AuthorizeMiddleware)
export class PostController extends BaseHttpController {
    @httpGet("/")
    private async getPosts(req: express.Request, res: express.Response, next: express.NextFunction): Promise<Post[]> {
        try {
            let where;

            if (req.query.channelId) {
                where = { channelId: req.query.channelId }
            }
            
            return await Post.find({ where: where, relations: ['channel'], order: { 'createdAt': 'DESC' }});
        } catch (error) {
            res.status(500).end();
        }
    }

    @httpGet("/:id")
    private async getOne(@requestParam("id") id: number, req: express.Request, res: express.Response, next: express.NextFunction): Promise<Post> {
        try {
            const post = await Post.findOne(id);

            if (post) {
                return post;
            } else {
                res.status(404).end();
            }
        } catch (error) {
            console.log(error);
            res.status(500).end();
        }
    }

    @httpPost("/")
    private async create(@requestBody() post: Post, req: express.Request, res: express.Response, next: express.NextFunction): Promise<Post> {
        try {
            return await Post.create({ ...post, owner: { uid: this.httpContext.user.details.uid }}).save();
        } catch (error) {
            console.log(error);
            res.status(500).end();
        }
    }

    @httpDelete("/:id")
    private async delete(@requestParam("id") id: number, req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        const post = await Post.findOne(id);

        if (!post) {
            res.status(404).end();
            return;
        } else if (!await this.httpContext.user.isResourceOwner(post)) {
            res.status(403).end();
            return;
        }
        
        try {
            await Post.delete(id);
            res.status(200).end();
        } catch (error) {
            res.status(500).end();
        }
    }
}