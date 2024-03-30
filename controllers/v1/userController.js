const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();

function welcome(req, res) {
    res.json({
        status: true,
        message: 'Selamat datang di web Bank!',
        data: null
    })
}

module.exports = {
    welcome,
    create: async (req, res, next) => {
        try {
            if (!req.body.name || !req.body.email || !req.body.password || !req.body.identity_type || !req.body.identity_number || !req.body.address) {
                return res.status(400).json({
                    status: false,
                    message: 'field cannot empty!',
                    data: null
                })
            }
            const newUser = await prisma.user.create({
                data: {
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    profile: {
                        create: {
                            identity_type: req.body.identity_type,
                            identity_number: req.body.identity_number,
                            address: req.body.address
                        }
                    }
                },
                include: {
                    profile: true
                }
            });

            res.status(201).json({
                status: 'true',
                message: 'ok',
                data: newUser
            })

        } catch (err) {
            next(err)
        }
    },

    index: async (req, res, next) => {
        try {
            let users = await prisma.user.findMany()

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
            let user = await prisma.user.findUnique({ where: { id: id } })

            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: `cant find user with id ${id}`,
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