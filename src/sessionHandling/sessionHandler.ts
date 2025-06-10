import type { NextFunction, Request, RequestHandler, Response } from "express";
import session from "express-session";


declare module "express-session"
{
    interface Session {
        authenticated: boolean,
        username: string
    }
}

export const sessionInitialization: RequestHandler = session(
    {
        resave: false,
        saveUninitialized: false,
        secret: 'a8905NSvo6Ao7nLvUJ1',
        cookie: {
            /** The first number is the time in seconds (multiplied by 1000 bebause the attribute is in milliseconds) and the rest are minutes, hours etc.
             * In this case the maxAge is 5 minutes
             */
            secure: true,
            httpOnly: true,
            maxAge: 60000 * 5
        }
    }
)


export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (!req.session.authenticated) {
        if (req.path === '/') {
            return res.redirect('/login')
        }
        else if (req.path === '/login' || req.path === '/signup') {
            return next()
        }
        else {
            return res.redirect('/login')
        }
    }
    else {
        return next()
    }
}