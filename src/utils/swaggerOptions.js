const swaggerOptions = {
    definition: {
        openapi: "3.0.0",

        info:{
            title: "My APP Live",
            version: "1.0.0",
            description: "Third proyect for Acamica's Backend Bootcamp."
        },

        servers: [{
            url: "http://first-deploy-506016382.us-east-1.elb.amazonaws.com/api",
            description: 'Local server'
        }],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },

        security: [{
            bearerAuth: []
        }]
    },

    apis: ["./src/routes/*.js"]
}

module.exports = swaggerOptions