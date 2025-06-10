import { type Request, type Response, Router } from "express";
import { isAuthenticated } from "../sessionHandling/sessionHandler.js";
import type { DB_Result, User } from "../utils/types.js";
import { assert } from "console";
import { checkCredentials, createUser } from "../databaseHandling/dbConnection.js";
import { computeSHA256, getMessageByStatusCode } from "../utils/utils.js";


export const router = Router()

router.route('/login')

    .get((req: Request, res: Response) => {
        res.render('login')
    })

    .post(async (req: Request, res: Response) => {

        if (req.body.Username && req.body.Password) {

            assert(typeof req.body.Username === "string", "The Username given is not a valid value")
            assert(typeof req.body.Password === "string", "The Password given is not a valid value")

            const user: User = {
                Username: req.body.Username,
                Password: computeSHA256(req.body.Password)
            }

            const login_result: DB_Result = await checkCredentials(user)

            if (login_result.success && login_result.statusCode === 200) {
                req.session.authenticated = true
                req.session.username = user.Username

                console.log("redirecting user")

                res.redirect('/home')
            }
            else if (!login_result.success && login_result.statusCode > 0) {
                res.status(login_result.statusCode).send(getMessageByStatusCode(login_result.statusCode))
            }
        }


    })

router.delete('/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            console.log("status while destroying session " + err)
            res.status(500).send("status while logging out")
        }
        else {
            console.log("Session destroyed")
            res.redirect('/login')
        }

    })
})


router.route('/signup')

    .get((req: Request, res: Response) => {
        res.render('signup')
    })

    .post(async (req: Request, res: Response) => {
        if (req.body.Username && req.body.Password) {

            assert(typeof req.body.Username === "string", "The Username given is not a valid value")
            assert(typeof req.body.Password === "string", "The Password given is not a valid value")

            const user: User = {
                Username: req.body.Username,
                Password: computeSHA256(req.body.Password)
            }

            const signup_result: DB_Result = await createUser(user)

            if (signup_result.success && signup_result.statusCode === 201) {
                console.log("redirecting user")

                res.redirect(303, '/login')
            }
            else if (!signup_result.success && signup_result.statusCode > 0) {
                res.status(signup_result.statusCode).send(getMessageByStatusCode(signup_result.statusCode))
            }
        }

    })