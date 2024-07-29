class Idao {
    getAll() { throw new Error("Method not implemented"); }
    getById(id) { throw new Error("Method not implemented"); }
    create(entity) {throw new Error("Method not implemented"); }
    update(id, entity) { throw new Error("Method not implement"); }
    delete(id) { throw new Error("Method not implement"); }

    
}

module,exports = Idao;

const Idao = require('./Idao');
const User = require('../models/User');

class UserDaoMongo extends Idao {
    async getAll() {
        return User.find();
    }



    async getById(id) {
        return User.findById(id);
    }


    async create(user) {
        return User.create(user);
    }


    async update(id, user) {
        return User.findByIdAndUpdate(id, user, { new: true });
    }


    async delete(id) {
        return User.findByIdAndDelete(id);
    }
}


const UserDaoMongo = require('./UserDaoMongo');

class DaoFctory {
    static getDao(type) {
        switch (type) {
            case 'mongo':
                return new UserDaoMongo();
                default:
                    throw new Error('Unknown DAO type');
        }
    }
}

module.exports = DaoFactory;


class UserRepository {
    constructor(dao) {
        this.dao = dao;
    }


    async getAllUsers() {
        return this.dao.getAll();
    }


    async getUserById(id) {
        return this.dao.getById(id);

    }



    async createUser(user) {
        return this.dao.create(user);
    }


    async updateUser(id, user) {
        return this.dao.update(id, user);
    }


    async deleteUser(id) {
        return this.dao.delete(id)
    }
}

class UserDTO {
    constructor(user) {
        this.id = user._id;
        this.name = user.name;
        this.email = user.email;

    }
}

module.exports = UserDTO


const authMiddleware = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json ({ message: 'Unauthorized' });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden'})
        }
        next();
    };
};

module.exports = authMiddleware;


const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    code: { type: String, unique: true, required: true },
    purchase_datetime: { type: Date, default: Date.now, required: true },
    amount: { type: Number, required: true },
    purchaser: { type: String, require: true }

});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;


const express = require('express');
const mongoose = require('mongoose');
const DaoFactory = require('./dao/DaoFactory');
const UserRepository = require('./repositories/UserRepository');
const authMiddleware = require('./middlewares/authMiddleware');
const cartsRouter = require('./routes/carts');
const UserDTO = require('./dtos/UserDTO');

const app = express();

mongoose.connect('mongodb://localhost: 8080/mydatabase', {
    userNewUrlparser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

app.use(express.json());


// middleware de autenticacion

app.use((req, res, next) => {
    req.use = { _id: 'userId', email: 'fedemarcheg@gmail.com', role: 'user' }; // simulacion de autenticacion de usuario 

    next();
});

//inicializacion del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});

const jwt = require('jsonwebtoken');
const User = require('./models/User');

const authenticate = async (req, res, next) => {
    const token = req.header('authorizacion').replace('Bearer', '');
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'please authenticate.' });
    }
};

module.exports = authenticate;


const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));




const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.conbine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'conbined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.simple()
    }));
}

module.exports = logger;