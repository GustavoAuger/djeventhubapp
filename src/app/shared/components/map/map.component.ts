import { Component, ElementRef, OnInit, ViewChild, Output, EventEmitter, AfterViewInit, Input, OnChanges } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader'; // Usa el Loader de Google Maps
import { environment } from '../../../../environments/environment';
import { Geolocation } from '@capacitor/geolocation';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit,OnChanges {
  @ViewChild('mapContainer', { static: false }) mapContainer: ElementRef;
    
  @ViewChild('searchInput', { static: false }) searchInput: ElementRef; // Para capturar el campo de texto

  @Input() location: { lat: number, lng: number }; 
  
  @Output() locationSelected = new EventEmitter<{ lat: number, lng: number }>();


  autocomplete: google.maps.places.Autocomplete;
  map: google.maps.Map;
  marker: google.maps.marker.AdvancedMarkerElement | null = null;



  private loader = new Loader({
    apiKey: environment.googleMapsApiKey,
    version: 'weekly',
    libraries: ['places', 'marker'] // Asegúrate de incluir la biblioteca de marcadores
  });

  ngOnInit() {
    this.loader.load().then(() => {
      this.initMap();
    });
  }
  ngOnChanges() {
    // Actualiza el mapa cuando cambie la ubicación
    if (this.map && this.location) {
      this.map.setCenter(this.location);
      this.addMarker(this.location);
    }
  }
  addMarker(location: { lat: number, lng: number }) {
    if (this.marker) {
      this.marker.position = location;
    } else {
      this.marker = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: this.map,
      });
    }
  }
  
  async initMap() {
    const defaultLocation = { lat: -33.4489, lng: -70.6693 }; // Ubicación por defecto (Santiago, Chile)
    const initialLocation = this.location || defaultLocation;

    const mapOptions: google.maps.MapOptions = {
      center: initialLocation,
      zoom: 12,
      mapId: '6fd742fb8cb5c649' // Id del estilo de mapa
    };

    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
    this.addMarker(initialLocation);

    if (!this.location) {
      try {
        const position = await Geolocation.getCurrentPosition();
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.map.setCenter(userLocation);
        this.addMarker(userLocation);
      } catch (error) {
        console.error('Error getting user location', error);
      }
    }

    this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      this.onMapClick(event);
    });
  }
  createMap(location: { lat: number, lng: number }) {
    const mapOptions: google.maps.MapOptions = {
      center: location,
      zoom: 12,
      mapId: '6fd742fb8cb5c649',
    };
  }

  initMapWithDefaultLocation() {
    const mapOptions: google.maps.MapOptions = {
      center: this.location,
      zoom: 12,
      mapId: '6fd742fb8cb5c649' // Id del estilo de mapa
    };
    this.setupAutocomplete();
    
    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

    if (this.location) {
      this.addMarker(this.location);
    }

    this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      this.onMapClick(event);
    });
  }

  
  
  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      if (this.marker) {
        this.marker.position = event.latLng;
      } else {
        this.marker = new google.maps.marker.AdvancedMarkerElement({
          position: event.latLng,
          map: this.map,
        });
      }

      this.locationSelected.emit({ lat, lng });
    }
  }
  setupAutocomplete() {
    // Configurar Autocomplete para el campo de búsqueda
    const input = this.searchInput.nativeElement;
    this.autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ['geometry'], // Solo nos interesa la geometría para las coordenadas
      types: ['geocode'],   // Limitar a ubicaciones geográficas
    });

    // Cuando el usuario selecciona una opción del autocompletado
    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        
        // Actualizar el mapa con la nueva ubicación
        this.map.setCenter(newLocation);
        this.addMarker(newLocation);

        // Emitir el evento con la nueva ubicación
        this.locationSelected.emit(newLocation);
      }
    });
  }


}
