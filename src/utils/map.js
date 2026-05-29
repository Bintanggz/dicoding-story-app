import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon asset path issue in Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
});

class MapHelper {
  constructor() {
    this.map = null;
    this.markers = {};
    this.tileLayers = {};
  }

  _createLayers() {
    // 1. OpenStreetMap Layer
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // 2. Satellite Layer (Esri World Imagery)
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    return { osm, satellite };
  }

  initHomeMap(elementId, stories = [], onMarkerClick = null) {
    if (this.map) {
      this.destroy();
    }

    const { osm, satellite } = this._createLayers();
    this.tileLayers = { osm, satellite };

    // Default coordinate: Center of Indonesia
    const defaultCenter = [-2.548926, 118.0148634];
    const defaultZoom = 5;

    this.map = L.map(elementId, {
      center: defaultCenter,
      zoom: defaultZoom,
      layers: [osm] // default layer
    });

    // Layer control
    const baseMaps = {
      "OpenStreetMap": osm,
      "Satellite": satellite
    };
    L.control.layers(baseMaps).addTo(this.map);

    const markerGroup = [];
    this.markers = {};

    stories.forEach(story => {
      const { id, name, description, lat, lon } = story;
      if (lat !== undefined && lat !== null && lon !== undefined && lon !== null) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (!isNaN(latitude) && !isNaN(longitude)) {
          // Create marker
          const marker = L.marker([latitude, longitude]);
          
          // Setup popup content with clean layout and photo
          const popupContent = `
            <div style="width: 200px;">
              <img src="${story.photoUrl}" alt="Foto dari ${this._escapeHtml(name)}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
              <h3 style="font-size: 1rem; margin: 0 0 4px 0;">${this._escapeHtml(name)}</h3>
              <p style="font-size: 0.85rem; margin: 0; color: #666;">${this._escapeHtml(description)}</p>
            </div>
          `;
          marker.bindPopup(popupContent);

          // Marker click sync
          marker.on('click', () => {
            if (onMarkerClick) {
              onMarkerClick(id);
            }
          });

          marker.addTo(this.map);
          this.markers[id] = marker;
          markerGroup.push([latitude, longitude]);
        }
      }
    });

    // Fit map bounds if there are markers with locations
    if (markerGroup.length > 0) {
      this.map.fitBounds(L.latLngBounds(markerGroup), { padding: [40, 40] });
    }
  }

  initSelectionMap(elementId, initialLat = null, initialLon = null, onLocationSelect = null) {
    if (this.map) {
      this.destroy();
    }

    const { osm, satellite } = this._createLayers();
    this.tileLayers = { osm, satellite };

    // Default center to Jakarta if no initial location is provided
    const defaultCenter = initialLat && initialLon ? [initialLat, initialLon] : [-6.2088, 106.8456];
    const defaultZoom = initialLat && initialLon ? 13 : 10;

    this.map = L.map(elementId, {
      center: defaultCenter,
      zoom: defaultZoom,
      layers: [osm]
    });

    const baseMaps = {
      "OpenStreetMap": osm,
      "Satellite": satellite
    };
    L.control.layers(baseMaps).addTo(this.map);

    let activeMarker = null;

    // Place initial marker if coordinates exist
    if (initialLat && initialLon) {
      activeMarker = L.marker([initialLat, initialLon]).addTo(this.map);
    }

    // Map click listener
    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;

      if (activeMarker) {
        activeMarker.setLatLng(e.latlng);
      } else {
        activeMarker = L.marker(e.latlng).addTo(this.map);
      }

      // Pan to clicked location
      this.map.panTo(e.latlng);

      if (onLocationSelect) {
        onLocationSelect({ lat: lat.toFixed(6), lon: lng.toFixed(6) });
      }
    });
  }

  focusMarker(id) {
    const marker = this.markers[id];
    if (marker && this.map) {
      const latlng = marker.getLatLng();
      this.map.setView(latlng, 13);
      marker.openPopup();
    }
  }

  _escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markers = {};
    this.tileLayers = {};
  }
}

export default MapHelper;
