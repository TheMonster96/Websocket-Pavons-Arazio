import mysql, { Connection, ConnectionOptions, createConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { dotenvConf } from '../utils/utils.js';
import { DB_Result, User, User_Retrieved } from '../utils/types.js';

dotenvConf(import.meta.dirname, 2)

const access: ConnectionOptions = {
    host: process.env.DB_ADDRESS,
    database: process.env.DB,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
}


export async function checkCredentials(User: User): Promise<DB_Result> {
    let connection: Connection | null = null
    try {
        connection = await mysql.createConnection(access)

        const query = 'SELECT Users.Password, Users.User_Icon FROM Users WHERE Users.Username= ?'
        const [rows] = await connection.execute<User_Retrieved[]>(query, [User.Username])

        if (!rows || rows.length === 0) {
            console.log("Non existent user")
            return { success: false, statusCode: 404 };
        }
        else {
            const data = rows[0];
            if (data.Password === User.Password) {
                console.log("Matching user found")
                return { success: true, statusCode: 200 }
            }
            else {
                console.log("Password doesn't match")
                return { success: false, statusCode: 400 };
            }
        }

    } catch (error) {
        console.log(error)
        return { success: false, statusCode: 500 };
    }
    finally {
        await connection?.end()
    }
}

export async function createUser(User: User): Promise<DB_Result> {
    let connection: Connection | null = null
    try {
        connection = await mysql.createConnection(access)

        const query = 'INSERT INTO `users` (`Username`, `Password`, `User_Icon`) VALUES (?, ?, NULL)'
        const [success] = await connection.execute<ResultSetHeader>(query, [User.Username, User.Password])

        console.log(success)

        if (success.affectedRows > 0) {
            console.log("User successfully created")
            return { success: true, statusCode: 201 }
        }
        else {
            console.log("User not created")

            return { success: false, statusCode: 400 }
        }

    } catch (error) {
        console.log(error)
        return { success: false, statusCode: 500 };
    }
    finally {
        await connection?.end()
    }
}
