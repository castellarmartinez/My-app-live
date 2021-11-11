const swaggerOptions = 
{
    definition: 
    {
        openapi: "3.0.0",
        info:
        {
            title: "My Persistent APP",
            version: "1.0.0",
            description: "Second proyect for the Backend Bootcamp of Acamica."
        },
        servers: 
        [
            {
                url: "http://localhost:3000",
                description: 'Local server'
            }
        ],
        components: 
        {
            securitySchemes: 
            {
                bearerAuth: 
                {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: 
        [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ["./src/routes/*.js"]
}

module.exports = swaggerOptions