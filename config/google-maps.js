// Configuração do Google Maps
const GOOGLE_MAPS_CONFIG = {
    // Substitua pela sua chave da API do Google Maps
    API_KEY: 'AIzaSyDayIUej5qM0eZwecPjTvD4RgrM8v13SKo',
    
    // Configurações padrão do mapa
    DEFAULT_LOCATION: {
        lat: -23.5505,
        lng: -46.6333
    },
    
    DEFAULT_ZOOM: 15,
    
    // Estilos do mapa
    MAP_STYLES: [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        }
    ]
};

// Função para obter a URL da API do Google Maps
function getGoogleMapsScriptUrl() {
    return `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.API_KEY}&libraries=geometry&loading=async`;
}

// Função para obter as configurações do mapa
function getMapConfig() {
    return {
        zoom: GOOGLE_MAPS_CONFIG.DEFAULT_ZOOM,
        center: GOOGLE_MAPS_CONFIG.DEFAULT_LOCATION,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: GOOGLE_MAPS_CONFIG.MAP_STYLES
    };
}

// Tornar funções disponíveis globalmente
window.GOOGLE_MAPS_CONFIG = GOOGLE_MAPS_CONFIG;
window.getGoogleMapsScriptUrl = getGoogleMapsScriptUrl;
window.getMapConfig = getMapConfig;
