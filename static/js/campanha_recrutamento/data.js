// Mock data for campaigns and candidates
console.log("Loading mock data for recruitment campaigns...");
const mockCampaigns = [
    {
        id: 1,
        name: "Desenvolvedores Frontend",
        position: "Desenvolvedor Frontend",
        description: "Campanha de prospecção para desenvolvedores frontend experientes em React e Vue.js",
        leadCount: 45,
        progress: 75,
        status: "ativa",
        created: "2024-01-15"
    },
    {
        id: 2,
        name: "Analistas de Dados",
        position: "Analista de Dados",
        description: "Busca por profissionais especializados em análise de dados e business intelligence",
        leadCount: 32,
        progress: 60,
        status: "ativa",
        created: "2024-01-20"
    },
    {
        id: 3,
        name: "Gerentes de Produto",
        position: "Gerente de Produto",
        description: "Prospecção de product managers com experiência em metodologias ágeis",
        leadCount: 28,
        progress: 90,
        status: "pausada",
        created: "2024-01-10"
    },
    {
        id: 4,
        name: "Designers UX/UI",
        position: "Designer UX/UI",
        description: "Campanha para designers com foco em experiência do usuário e interfaces digitais",
        leadCount: 56,
        progress: 100,
        status: "finalizada",
        created: "2024-01-05"
    },
    {
        id: 5,
        name: "Desenvolvedores Backend",
        position: "Desenvolvedor Backend",
        description: "Busca por desenvolvedores backend com experiência em Node.js, Python e Java",
        leadCount: 38,
        progress: 45,
        status: "ativa",
        created: "2024-01-25"
    }
];

const mockLeads = {
    1: [ // Desenvolvedores Frontend
        {
            id: 1,
            name: "João Silva Santos",
            phone: "(11) 99999-1234",
            email: "joao.silva@email.com",
            birthDate: "1992-05-15",
            status: "fit 10",
            score: 9.5,
            campaignId: 1
        },
        {
            id: 2,
            name: "Maria Oliveira Costa",
            phone: "(11) 98888-5678",
            email: "maria.oliveira@email.com",
            birthDate: "1988-12-03",
            status: "em processamento",
            score: 8.2,
            campaignId: 1
        },
        {
            id: 3,
            name: "Pedro Almeida Rocha",
            phone: "(11) 97777-9012",
            email: "pedro.almeida@email.com",
            birthDate: "1995-08-22",
            status: "aguardando",
            score: 7.8,
            campaignId: 1
        },
        {
            id: 4,
            name: "Ana Carolina Ferreira",
            phone: "(11) 96666-3456",
            email: "ana.ferreira@email.com",
            birthDate: "1990-11-18",
            status: "fit 5",
            score: 6.5,
            campaignId: 1
        },
        {
            id: 5,
            name: "Carlos Eduardo Lima",
            phone: "(11) 95555-7890",
            email: "carlos.lima@email.com",
            birthDate: "1987-03-07",
            status: "sem interesse",
            score: 4.2,
            campaignId: 1
        }
    ],
    2: [ // Analistas de Dados
        {
            id: 6,
            name: "Fernanda Souza Martins",
            phone: "(11) 94444-1111",
            email: "fernanda.souza@email.com",
            birthDate: "1991-09-12",
            status: "fit 10",
            score: 9.8,
            campaignId: 2
        },
        {
            id: 7,
            name: "Ricardo Pereira Santos",
            phone: "(11) 93333-2222",
            email: "ricardo.pereira@email.com",
            birthDate: "1989-06-25",
            status: "em processamento",
            score: 8.7,
            campaignId: 2
        },
        {
            id: 8,
            name: "Juliana Rodrigues Silva",
            phone: "(11) 92222-3333",
            email: "juliana.rodrigues@email.com",
            birthDate: "1993-01-14",
            status: "aguardando",
            score: 7.3,
            campaignId: 2
        }
    ],
    3: [ // Gerentes de Produto
        {
            id: 9,
            name: "Bruno Costa Alves",
            phone: "(11) 91111-4444",
            email: "bruno.costa@email.com",
            birthDate: "1985-04-30",
            status: "fit 5",
            score: 8.1,
            campaignId: 3
        },
        {
            id: 10,
            name: "Camila Ribeiro Nunes",
            phone: "(11) 90000-5555",
            email: "camila.ribeiro@email.com",
            birthDate: "1987-10-08",
            status: "fit 10",
            score: 9.2,
            campaignId: 3
        }
    ],
    4: [ // Designers UX/UI
        {
            id: 11,
            name: "Lucas Mendes Barbosa",
            phone: "(11) 89999-6666",
            email: "lucas.mendes@email.com",
            birthDate: "1992-07-19",
            status: "fit 10",
            score: 9.7,
            campaignId: 4
        },
        {
            id: 12,
            name: "Tatiana Gomes Carvalho",
            phone: "(11) 88888-7777",
            email: "tatiana.gomes@email.com",
            birthDate: "1990-12-11",
            status: "fit 5",
            score: 8.4,
            campaignId: 4
        }
    ],
    5: [ // Desenvolvedores Backend
        {
            id: 13,
            name: "Gabriel Fernandes Dias",
            phone: "(11) 87777-8888",
            email: "gabriel.fernandes@email.com",
            birthDate: "1994-02-28",
            status: "em processamento",
            score: 8.9,
            campaignId: 5
        },
        {
            id: 14,
            name: "Isabela Santos Moreira",
            phone: "(11) 86666-9999",
            email: "isabela.santos@email.com",
            birthDate: "1991-11-05",
            status: "aguardando",
            score: 7.6,
            campaignId: 5
        }
    ]
};

const mockWhatsAppChats = {
    1: [
        { sender: "agent", message: "Olá João! Vi seu perfil e gostaria de conversar sobre uma oportunidade de Frontend Developer. Você tem interesse?", time: "14:30" },
        { sender: "user", message: "Oi! Sim, tenho interesse sim. Pode me contar mais sobre a oportunidade?", time: "14:32" },
        { sender: "agent", message: "Claro! É uma posição para trabalhar com React e Vue.js, em uma startup de tecnologia. Salário competitivo e benefícios. Quando podemos conversar por telefone?", time: "14:35" },
        { sender: "user", message: "Que legal! Posso conversar amanhã pela manhã, por volta das 10h. Pode ser?", time: "14:37" },
        { sender: "agent", message: "Perfeito! Vou ligar amanhã às 10h. Obrigado pelo interesse!", time: "14:38" }
    ],
    2: [
        { sender: "agent", message: "Oi Maria! Tudo bem? Estamos com uma oportunidade incrível de Frontend e seu perfil chamou nossa atenção!", time: "09:15" },
        { sender: "user", message: "Oi! Tudo ótimo, obrigada. Estou sempre aberta a novas oportunidades. O que vocês têm?", time: "09:18" },
        { sender: "agent", message: "É uma posição híbrida, trabalho com as principais tecnologias do mercado. Posso enviar mais detalhes por email?", time: "09:20" },
        { sender: "user", message: "Sim, por favor! Meu email é maria.oliveira@email.com", time: "09:22" }
    ],
    3: [
        { sender: "agent", message: "Olá Pedro! Como vai? Estamos com uma campanha de prospecção para desenvolvedores frontend. Tem interesse em saber mais?", time: "16:45" },
        { sender: "user", message: "Oi! Vou bem, obrigado. No momento não estou procurando novas oportunidades, mas obrigado pelo contato!", time: "17:20" },
        { sender: "agent", message: "Sem problemas! Fico à disposição caso mude de ideia. Tenha um ótimo dia!", time: "17:22" }
    ],
    // Default chat for leads without specific history
    default: [
        { sender: "agent", message: "Olá! Vi seu perfil e gostaria de conversar sobre uma oportunidade. Você tem interesse?", time: "10:00" },
        { sender: "user", message: "Oi! Sim, quero saber mais sobre a oportunidade.", time: "10:05" },
        { sender: "agent", message: "Ótimo! Vou enviar mais detalhes por email e depois podemos agendar uma conversa.", time: "10:07" }
    ]
};

// Export functions to access the data
function getCampaigns() {
    return mockCampaigns;
}

function getLeadsByCampaign(campaignId) {
    return mockLeads[campaignId] || [];
}

function getCampaignById(campaignId) {
    return mockCampaigns.find(campaign => campaign.id === parseInt(campaignId));
}

function getWhatsAppChat(leadId) {
    return mockWhatsAppChats[leadId] || mockWhatsAppChats.default;
}

function addCampaign(campaignData) {
    const newId = Math.max(...mockCampaigns.map(c => c.id)) + 1;
    const newCampaign = {
        id: newId,
        name: campaignData.name,
        description: campaignData.description,
        leads: Math.floor(Math.random() * 50) + 10, // Random number for demo
        progress: Math.floor(Math.random() * 100),
        status: "ativa",
        createdAt: new Date().toISOString().split('T')[0]
    };
    mockCampaigns.push(newCampaign);
    return newCampaign;
}

function updateCampaignStatus(campaignId, newStatus) {
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if (campaign) {
        campaign.status = newStatus;
        return campaign;
    }
    return null;
}
