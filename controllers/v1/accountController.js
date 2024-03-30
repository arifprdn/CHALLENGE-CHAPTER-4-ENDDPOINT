const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();


module.exports = {
    create: async (req, res, next) => {
        try {
            if (!req.body.bank_name || !req.body.bank_account_number || !req.body.balance || !req.body.user_id) {
                return res.status(400).json({
                    status: false,
                    message: 'field cannot empty!',
                    data: null
                })
            }
            const newAccount = await prisma.bankAccount.create({
                data: {
                    bank_name: req.body.bank_name,
                    bank_account_number: req.body.bank_account_number,
                    balance: req.body.balance,
                    user_id: req.body.user_id
                }
            });

            res.status(201).json({
                status: 'true',
                message: 'ok',
                data: newAccount
            })

        } catch (err) {
            next(err)
        }
    },

    index: async (req, res, next) => {
        try {
            let users = await prisma.bankAccount.findMany()

            res.status(200).json({
                status: true,
                message: 'ok',
                data: users
            })
        } catch (err) {
            next(err)
        }
    },

    show: async (req, res, next) => {
        try {
            let id = Number(req.params.id)
            let user = await prisma.bankAccount.findUnique({ where: { id: id } })

            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: `cant find Account with id ${id}`,
                    data: null
                })
            }

            res.status(200).json({
                status: true,
                message: `ok`,
                data: user
            })
        } catch (err) {
            next(err)
        }
    }
}