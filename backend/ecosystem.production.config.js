module.exports = {
  apps: [
    {
      name: 'arbitragem-backend',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      // Configurações de produção
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // Restart automático em caso de erro
      max_restarts: 10,
      min_uptime: '10s',
      // Configurações de cluster
      exec_mode: 'fork',
      // Variáveis de ambiente específicas
      env_file: '.env'
    }
  ]
};

