# Módulo de Saúde Mental - Fórum Reequilibra

Implementação do fórum de saúde mental com:

- Diário emocional
- Artigos científicos
- Comunidades de apoio
- Sistema de gamificação

apresentacao-forum/
├── index.html      # Página principal
├── style.css       # Estilos personalizados
├── script.js       # Lógica da apresentação
└── assets/
    ├── mockups/    # Imagens ilustrativas
    └── data/       # JSON do colega (apenas para consulta)

Atualização da estrutura:

    apresentacao-forum/
├── index.html
├── forum.html
├── style.css
├── forum.css
├── script.js
├── forum.js
├── db.json
└── assets/
    ├── data/
    └── mockups/

    -Por favor acesse o site rodando o JSON SERVER:
    npx json-server --watch db.json --port 3000
