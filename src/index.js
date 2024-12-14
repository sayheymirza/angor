require('dotenv/config');

const express = require('express');
const { RequestValidator } = require('fastest-express-validator');

const database = require('./core/database');
const format = require('./core/format');

const PORT = process.env.PORT ?? 3000;
const PASSWORD = process.env.PASSWORD;

const app = express();

app.use(require('cors')());
app.use(express.json());

app.get('/api/v1/traefik/v3/provider', (req, res) => {
    const data = database.load();
    const result = format(data);

    res.json(result);
});

app.use((req, res, next) => {
    const password = req.headers['x-password'] || req.query['password'] || req.body['password'];

    if (password == PASSWORD) {
        return next();
    }

    res.status(403).json({
        status: false,
        code: 403,
        i18n: "FORBIDDEN",
        message: "Forbidden"
    });
});

app.get('/api/v1/route', (req, res) => {
    const data = database.load();

    res.json({
        status: true,
        code: 200,
        i18n: 'ALL_ROUTES',
        message: 'All routes',
        meta: {
            total: data.length,
        },
        data: data
    });
});

app.post('/api/v1/route', RequestValidator({

    body: {
        domain: {
            type: "string"
        },
        host: {
            type: "string"
        },
        port: {
            type: "number",
            convert: true,
            min: 1,
            max: 65535
        }
    }

}, (err, req, res, next) => {
    if (err) {
        return res.status(401).json({
            status: false,
            code: 401,
            i18n: 'BAD_DATA',
            message: 'Bad data',
            data: err,
        });
    }

    next();
}), (req, res) => {
    let data = database.load();

    const { domain, host, port } = req.body;

    // find domain exists in data
    const index = data.findIndex(((item) => item['domain'] == domain));

    if (index == -1) {
        data.push({
            domain,
            host,
            port
        });
    } else {
        data[index] = {
            domain,
            host,
            port
        };
    }

    database.save(data);

    res.json({
        status: true,
        code: 200,
        i18n: 'ALL_ROUTES',
        message: 'All routes',
        meta: {
            total: data.length,
        },
        data: data
    });
});

app.delete('/api/v1/route', RequestValidator({
    body: {
        domain: {
            type: "string"
        }
    }
}, (err, req, res, next) => {
    if (err) {
        return res.status(401).json({
            status: false,
            code: 401,
            i18n: 'BAD_DATA',
            message: 'Bad data',
            data: err,
        });
    }

    next();
}), (req, res) => {
    const data = database.load();

    const { domain } = req.body;

    // find domain exists in data
    const index = data.findIndex(((item) => item['domain'] == domain));

    if (index == -1) {
        return res.status(404).json({
            status: false,
            code: 404,
            i18n: 'DOMAIN_NOT_FOUND',
            message: `Domain ${domain} not found`,
        });
    }

    data.splice(index, 1);

    database.save(data);

    res.json({
        status: true,
        code: 200,
        i18n: 'ALL_ROUTES',
        message: 'All routes',
        meta: {
            total: data.length,
        },
        data: data
    });
});

app.get('/', (req, res) => {
    res.json({
        status: true,
        code: 200,
        i18n: 'WELCOME',
        message: 'Welcome to Angor',
        data: {
            version: '1.0.0',
        }
    });
});

app.use((req, res) => {
    res.status(404).json({
        status: false,
        code: 404,
        i18n: 'NOT_FOUND',
        message: 'Not found',
    });
});

app.listen(PORT, () => {
    console.log(`Angor started on port ${PORT}`);
});