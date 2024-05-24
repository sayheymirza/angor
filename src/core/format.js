const TRAEFIK_CERT_RESOLVER = progress.env.TRAEFIK_CERT_RESOLVER ?? 'cert';

module.exports = (input = []) => {
    let http_routers = {};
    let http_middlewares = {};
    let http_services = {};

    for (let item of input) {
        item.name = item.domain.split('.').join('_');

        http_routers[item.name] = {
            rule: "HOST(`" + item.domain + "`)",
            service: item.name,
            middlewares: `${item.name}_middleware`,
            tls: {
                certResolver: TRAEFIK_CERT_RESOLVER,

            }
        };

        http_services[item.name] = {
            loadBalancer: {
                servers: [
                    {
                        url: `http://${item.host}:${item.port}`,
                    },
                ],
            },
        };

        http_middlewares[`${item.name}_middleware`] = {
            compress: true
        }
    }

    return {
        http: {
            routers: http_routers,
            middlewares: http_middlewares,
            services: http_services,
        }
    }
}