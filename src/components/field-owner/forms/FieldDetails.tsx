import React from 'react';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/components/ui/custom-select';
import { CustomCheckbox } from '@/components/ui/custom-checkbox';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { TimeInput } from '@/components/ui/time-input';

interface FieldDetailsProps {
  formData: any;
  setFormData: (updater: any) => void;
}

export default function FieldDetails({ formData, setFormData }: FieldDetailsProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  console.log('fieldData formData',formData);

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev: any) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity]
      }
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2 text-dark-green font-sans">
          Tell us about your field
        </h1>
        <p className="text-base text-gray-text font-sans">
          Share key details like size, fencing, amenities, and what makes your space perfect for safe, off-lead adventures.
        </p>
      </div>

      {/* Basic Info Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Basic Info
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Field Name
            </label>
            <Input
              type="text"
              name="fieldName"
              value={formData.fieldName}
              onChange={handleInputChange}
              placeholder="Enter field name"
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Field Size
              </label>
              <CustomSelect
                name="fieldSize"
                value={formData.fieldSize}
                onChange={(value) => handleInputChange({ target: { name: 'fieldSize', value } } as any)}
                placeholder="Select size"
                options={[
                  { value: 'small', label: 'Small (1 acre or less)' },
                  { value: 'medium', label: 'Medium (1-3 acres)' },
                  { value: 'large', label: 'Large (3+ acres)' }
                ]}
              />
            </div>

            <div className=''>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Terrain Type
              </label>

              <CustomSelect
                name="terrainType"
                value={formData.terrainType}
                onChange={(value) => handleInputChange({ target: { name: 'terrainType', value } } as any)}
                placeholder="Select terrain type"
                options={[
                  { value: 'soft-grass', label: 'Soft Grass' },
                  { value: 'walking-path', label: 'Walking Path' },
                  { value: 'wood-chips', label: 'Wood Chips' },
                  { value: 'artificial-grass', label: 'Artificial Grass' },
                  { value: 'mixed-terrain', label: 'Mixed Terrain' },
                ]}
              />
            </div>

            <div className='w-full'>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Fence Type
              </label>
              <CustomSelect
                name="fenceType"
                value={formData.fenceType}
                onChange={(value) => handleInputChange({ target: { name: 'fenceType', value } } as any)}
                placeholder="Select fence type"
                options={[
                  { value: 'post-and-wire', label: 'Post and Wire' },
                  { value: 'wooden-panel', label: 'Wooden Panel' },
                  { value: 'fully-enclosed-field-fencing', label: 'Fully Enclosed Field Fencing' },
                  { value: 'metal-rail', label: 'Metal Rail' },
                  { value: 'mixed-multiple-types', label: 'Mixed/Multiple Types' },
                  { value: 'no-fence', label: 'No Fence' }
                  
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Fence Size
              </label>
              <CustomSelect
                name="fenceSize"
                value={formData.fenceSize}
                onChange={(value) => handleInputChange({ target: { name: 'fenceSize', value } } as any)}
                placeholder="Select fence size"
                options={[
                    {value:'under-1-metre',label: 'Under 1 metre (3 ft)'},
                    {value:'1-2-metres',   label: '1-2 metres (3-6 ft)'},
                    {value:'2-3-metres',   label: '2-3 metres (6-9 ft)'},
                    {value:'3-4-metres',   label: '3-4 metres (9-12 ft)'},
                    {value:'4-5-metres',   label: '4-5 metres (12-15 ft)'},
                    {value:'5-6-metres',   label: '5-6 metres (15-18 ft)'},
                    {value:'6-7-metres',label: '6-7 metres (18-21 ft)'},
                    {value:'7-8-metres',label: '7-8 metres (21-24 ft)'},
                    {value:'8-9-metres',label: '8-9 metres (24-27 ft)'},
                    {value:'9-10-metres',label: '9-10 metres (27-30 ft)'},
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Surface Type
              </label>
              <CustomSelect
                name="surfaceType"
                value={formData.surfaceType}
                onChange={(value) => handleInputChange({ target: { name: 'surfaceType', value } } as any)}
                placeholder="Select surface type"
                options={[
                  { value: 'grass', label: 'Grass' },
                  { value: 'gravel', label: 'Gravel' },
                  { value: 'mixed-terrain', label: 'Mixed Terrain' },
                  { value: 'meadow', label: 'Meadow' },
                  { value: 'paved-path', label: 'Paved Path' },
                  { value: 'flat-with-gentle-slopes', label: 'Flat with Gentle Slopes' },
                  { value: 'muddy', label: 'Muddy' },
                  { value: 'other', label: 'Other' }
                
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Max Number of Dogs Allowed
              </label>
              <Input
                type="text"
                name="maxDogs"
                value={formData.maxDogs}
                onChange={handleInputChange}
                placeholder="Enter max number of dogs allowed"
                className="py-3 appearance-none border-gray-border focus:border-green font-sans"
              />
            </div>
            
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Description
        </h2>
        <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
          Write a description of your field
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Write a description here..."
          rows={5}
          className="w-full px-4 py-3 bg-white rounded-2xl border border-gray-border focus:outline-none focus:border-green resize-none font-sans text-gray-input placeholder:text-gray-400"
        />
      </div>

      {/* Opening Days & Hours */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Opening Days & Hours
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Opening Days
            </label>
            <CustomSelect
              name="openingDays"
              value={formData.openingDays}
              onChange={(value) => handleInputChange({ target: { name: 'openingDays', value } } as any)}
              placeholder="Select opening days"
              options={[
                { value: 'everyday', label: 'Every day' },
                { value: 'weekdays', label: 'Weekdays only' },
                { value: 'weekends', label: 'Weekends only' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                Start Time
              </label>
              <TimeInput
                name="startTime"
                value={formData.startTime}
                onChange={(value) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    startTime: value
                  }));
                }}
                placeholder="Select start time"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
                End Time
              </label>
              <TimeInput
                name="endTime"
                value={formData.endTime}
                onChange={(value) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    endTime: value
                  }));
                }}
                placeholder="Select end time"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className=''>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Choose Amenities
        </h2>
        
        <div className="flex flex-wrap gap-3">
          {Object.entries({
            secureFencing: { icon: '/field-details/fence.svg', label: 'Secure Fencing' },
            waterAccess: { icon: '/add-field/water.svg', label: 'Water Access' },
            parking: { icon: '/payment/card.svg', label: 'Parking Available' },
            toilet: { icon: '/field-details/home.svg', label: 'Toilet Facilities' },
            shelter: { icon: '/add-field/shelter.svg', label: 'Shelter' },
            wasteDisposal: { icon: '/field-details/bin.svg', label: 'Waste Disposal' },
            dogAgility: { icon: '/add-field/dog-agility.svg', label: 'Dog Agility' },
            swimming: { icon: '/add-field/swimming.svg', label: 'Swimming Area' },
            playArea: { icon: '/add-field/dog-play.svg', label: 'Play Area' },
            cctv: { icon: '/add-field/cctv.svg', label: 'CCTV Security' },
            shadeAreas: { icon: '/add-field/tree.svg', label: 'Shade Areas' },
            lighting: { icon: '/add-field/clock.svg', label: 'Night Lighting' }
          }).map(([key, { icon, label }]) => (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => handleAmenityToggle(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAmenityToggle(key);
                }
              }}
              className={`px-4 py-2.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                formData.amenities[key] 
                  ? 'bg-cream border-green' 
                  : 'bg-white border-gray-200 hover:border-green/50'
              }`}
              aria-pressed={!!formData.amenities[key]}
            >
              <CustomCheckbox
                checked={formData.amenities[key] || false}
                onChange={() => handleAmenityToggle(key)}
              />
              <div className="flex items-center gap-2">
                <img 
                  src={icon} 
                  alt={label} 
                  className="w-5 h-5 object-contain"
                />
                <span className="font-sans text-sm text-dark-green">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-dark-green font-sans">
          Address
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Street Address
            </label>
            <AddressAutocomplete
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              placeholder="42 Meadowcroft Lane"
              className="w-full px-4 py-3 bg-white rounded-2xl border border-gray-border focus:outline-none focus:border-green font-sans text-gray-input placeholder:text-gray-400"
              onAddressSelect={(components) => {
                setFormData((prev: any) => ({
                  ...prev,
                  streetAddress: components.streetAddress,
                  city: components.city,
                  county: components.county,
                  postalCode: components.postalCode,
                  // Store the complete location object
                  location: {
                    streetAddress: components.streetAddress,
                    city: components.city,
                    county: components.county,
                    postalCode: components.postalCode,
                    lat: components.lat,
                    lng: components.lng,
                    formatted_address: components.formatted_address
                  }
                }));
              }}
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Apartment/Suite
            </label>
            <Input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleInputChange}
              placeholder="Flat 5B"
              className="py-3 border-gray-border focus:border-green font-sans"
            />
          </div> */}
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              City
            </label>
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Guildford"
              className="py-3 border-gray-border text-gray-input focus:border-green font-sans"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              County/State
            </label>
            <Input
              type="text"
              name="county"
              value={formData.county}
              onChange={handleInputChange}
              placeholder="Surrey"
              className="py-3 border-gray-border text-gray-input focus:border-green font-sans"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-green font-sans">
              Postal Code
            </label>
            <Input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="GU1 1AA"
              className="py-3 border-gray-border text-gray-input focus:border-green font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
}