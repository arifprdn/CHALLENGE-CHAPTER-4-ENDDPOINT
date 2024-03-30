const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();


module.exports = {
    transfer: async (req, res, next) => {
        try {
            if (!req.body.source_account_id || !req.body.destination_account_id || !req.body.amount) {
                return res.status(400).json({
                    status: false,
                    message: 'field cannot empty!',
                    data: null
                })
            }

            const source_account = await prisma.bankAccount.findUnique({ where: { id: req.body.source_account_id } })
            const destination_account = await prisma.bankAccount.findUnique({ where: { id: req.body.destination_account_id } })

            if (!source_account || !destination_account) {
                return res.status(400).json({
                    status: false,
                    message: 'sender or receiver is not exist!',
                    data: null
                })
            }

            if (req.body.source_account_id === req.body.destination_account_id) {
                return res.status(400).json({
                    status: false,
                    message: 'cant transfer to yourself!',
                    data: null
                })
            }

            if (source_account.balance <= 0 || (source_account.balance - req.body.amount) <= 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Sender dont have enough balance!',
                    data: null
                })
            }

            const newTransfer = await prisma.transaction.create({
                data: {
                    source_account_id: req.body.source_account_id,
                    destination_account_id: req.body.destination_account_id,
                    amount: req.body.amount
                }
            });

            const updateSenderBalance = await prisma.bankAccount.update({
                where: { id: req.body.source_account_id },
                data: {
                    balance: (source_account.balance - req.body.amount),
                },
            })

            const updateReceiverBalance = await prisma.bankAccount.update({
                where: { id: req.body.destination_account_id },
                data: {
                    balance: (destination_account.balance + req.body.amount),
                },
            })

            res.status(201).json({
                status: 'true',
                message: 'ok',
                data: newTransfer,
                balanceAfter: {
                    Sender: updateSenderBalance,
                    Receiver: updateReceiverBalance
                }
            })

        } catch (err) {
            next(err)
        }
    },

    index: async (req, res, next) => {
        try {
            let transactions = await prisma.transaction.findMany()

            res.status(200).json({
                status: true,
                message: 'ok',
                data: transactions
            })
        } catch (err) {
            next(err)
        }
    },

    show: async (req, res, next) => {
        try {
            let id = Number(req.params.id)
            let transaction = await prisma.transaction.findUnique({ where: { id: id } })
            let sender = await prisma.bankAccount.findUnique({ where: { id: transaction.source_account_id } })
            let receiver = await prisma.bankAccount.findUnique({ where: { id: transaction.destination_account_id } })

            if (!transaction) {
                return res.status(400).json({
                    status: false,
                    message: `cant find Transaction with id ${id}`,
                    data: null
                })
            }

            res.status(200).json({
                status: true,
                message: `ok`,
                data: transaction,
                account_info: {
                    Sender: sender,
                    Receiver: receiver
                }
            })
        } catch (err) {
            next(err)
        }
    }
}
