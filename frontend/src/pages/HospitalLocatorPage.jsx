import React, { useState } from 'react';
import {
  MapPinIcon, PhoneIcon, GlobeAltIcon, MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon, StarIcon, ClockIcon
} from '@heroicons/react/24/outline';

const HOSPITALS = [
  { id: 1, name: 'Tata Memorial Hospital', city: 'Mumbai', address: 'Dr. E Borges Road, Parel, Mumbai - 400012', phone: '+91-22-2417-7000', speciality: 'Cancer Centre', rating: 4.8, type: 'Government', website: 'https://tmc.gov.in', hours: 'Mon–Sat: 8AM–6PM', lat: 19.0048, lng: 72.8428 },
  { id: 2, name: 'AIIMS New Delhi', city: 'New Delhi', address: 'Ansari Nagar East, New Delhi - 110029', phone: '+91-11-2659-3308', speciality: 'Oncology & Breast Health', rating: 4.9, type: 'Government', website: 'https://aiims.edu', hours: 'Mon–Sat: 9AM–5PM', lat: 28.5672, lng: 77.2100 },
  { id: 3, name: 'Apollo Hospitals', city: 'Chennai', address: '21 Greams Lane, Off Greams Road, Chennai - 600006', phone: '+91-44-2829-0200', speciality: 'Breast Oncology', rating: 4.7, type: 'Private', website: 'https://apollohospitals.com', hours: '24/7 Emergency', lat: 13.0569, lng: 80.2425 },
  { id: 4, name: 'Kidwai Memorial Institute', city: 'Bengaluru', address: 'Dr. M.H. Marigowda Rd, Bengaluru - 560029', phone: '+91-80-2659-4077', speciality: 'Cancer & Research Centre', rating: 4.6, type: 'Government', website: 'https://kidwai.kar.nic.in', hours: 'Mon–Fri: 8AM–5PM', lat: 12.9352, lng: 77.5970 },
  { id: 5, name: 'Fortis Hospital', city: 'Gurugram', address: 'Sector 44, Opposite HUDA City Centre Metro, Gurugram - 122002', phone: '+91-124-4962222', speciality: 'Breast Cancer Surgery', rating: 4.5, type: 'Private', website: 'https://fortishealthcare.com', hours: '24/7', lat: 28.4595, lng: 77.0266 },
  { id: 6, name: 'Regional Cancer Centre', city: 'Thiruvananthapuram', address: 'Medical College PO, Thiruvananthapuram - 695011', phone: '+91-471-252-3001', speciality: 'Oncology', rating: 4.7, type: 'Government', website: 'https://rcctvpm.org', hours: 'Mon–Sat: 8AM–4PM', lat: 8.5241, lng: 76.9366 },
  { id: 7, name: 'Nanavati Super Speciality Hospital', city: 'Mumbai', address: 'S.V. Road, Vile Parle West, Mumbai - 400056', phone: '+91-22-2626-7500', speciality: 'Breast Health & Oncology', rating: 4.4, type: 'Private', website: 'https://nanavatimaxhospital.org', hours: '24/7', lat: 19.0988, lng: 72.8479 },
  { id: 8, name: 'Indraprastha Apollo Hospital', city: 'New Delhi', address: 'Sarita Vihar, Delhi–Mathura Road, New Delhi - 110076', phone: '+91-11-7179-1090', speciality: 'Breast Cancer & Oncology', rating: 4.8, type: 'Private', website: 'https://apollohospitals.com', hours: '24/7', lat: 28.5280, lng: 77.2920 },
  { id: 9, name: 'Medanta – The Medicity', city: 'Gurugram', address: 'CH Baktawar Singh Road, Sector 38, Gurugram - 122001', phone: '+91-124-414-1414', speciality: 'Cancer Institute', rating: 4.8, type: 'Private', website: 'https://medanta.org', hours: '24/7', lat: 28.4452, lng: 77.0475 },
  { id: 10, name: 'Homi Bhabha Cancer Hospital', city: 'Varanasi', address: 'Shivsagar Colony, Lahartara, Varanasi - 221002', phone: '+91-542-250-6001', speciality: 'Cancer Treatment & Research', rating: 4.6, type: 'Government', website: 'https://tmc.gov.in', hours: 'Mon–Sat: 8AM–6PM', lat: 25.3176, lng: 82.9739 },
];

const cities = ['All Cities', ...new Set(HOSPITALS.map(h => h.city))];

export default function HospitalLocatorPage() {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = HOSPITALS.filter(h => {
    const matchCity = cityFilter === 'All Cities' || h.city === cityFilter;
    const matchType = typeFilter === 'All' || h.type === typeFilter;
    const matchSearch = !search ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase()) ||
      h.speciality.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchType && matchSearch;
  });

  const openMaps = (h) => {
    window.open(`https://maps.google.com/?q=${h.lat},${h.lng}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="section-label">Find Care Near You</div>
        <h1 className="page-title">Hospital & Clinic Locator</h1>
        <p className="text-gray-500 text-sm">Find breast health specialists and oncology centres across India.</p>
      </div>

      {/* Search & Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="input-field pl-9 text-sm py-2.5"
              placeholder="Search hospitals by name, city, or speciality..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field text-sm py-2.5 md:w-48"
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
          >
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
          <select
            className="input-field text-sm py-2.5 md:w-40"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Government">Government</option>
            <option value="Private">Private</option>
          </select>
        </div>
        <div className="mt-3 text-sm text-gray-500">
          Showing <strong>{filtered.length}</strong> of {HOSPITALS.length} hospitals
        </div>
      </div>

      {/* Map placeholder */}
      <div className="card bg-gradient-to-br from-gray-50 to-blue-50 border border-blue-100 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-gray-700 text-sm">Map View</span>
          </div>
          <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-semibold">Google Maps Integration</span>
        </div>
        <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex flex-col items-center justify-center text-center gap-2">
          <MapPinIcon className="w-10 h-10 text-blue-400" />
          <p className="text-blue-600 font-semibold text-sm">Interactive Map</p>
          <p className="text-blue-400 text-xs max-w-xs">Add your Google Maps API key in the environment settings to enable the interactive map view with real-time location.</p>
        </div>
      </div>

      {/* Hospital cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 card text-center py-16">
            <MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hospitals found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : filtered.map(h => (
          <div key={h.id} className="card hover:shadow-md transition-all duration-200 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${h.type === 'Government' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {h.type}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{h.name}</h3>
                <p className="text-xs text-rose-600 font-medium mt-0.5">{h.speciality}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 ml-3 flex-shrink-0">
                <StarIcon className="w-4 h-4 fill-amber-400" />
                <span className="text-sm font-bold text-gray-700">{h.rating}</span>
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs leading-relaxed">{h.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href={`tel:${h.phone}`} className="text-xs text-rose-600 hover:text-rose-700 font-medium">{h.phone}</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500">{h.hours}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => openMaps(h)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 py-2 px-3 rounded-lg transition-colors"
              >
                <MapPinIcon className="w-3.5 h-3.5" />
                Get Directions
              </button>
              <a
                href={h.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-lg transition-colors"
              >
                <GlobeAltIcon className="w-3.5 h-3.5" />
                Website
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
