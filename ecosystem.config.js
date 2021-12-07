module.exports = {
    apps: [{
        name: 'api',
        script: './src/index.js',
        watch: true,
        
        env_local: 
        {
            'NODE_ENV': 'local',
            'API_DESCRIPTION': 'Estás ejecutando tu API en modo desarrollador.' 
        },

        env_production: 
        {
            'NODE_ENV': 'production',
            'API_DESCRIPTION': 'Estás ejecutando tu API en producción. ¡¡Ten cuidado!!'
        }
    }]
}