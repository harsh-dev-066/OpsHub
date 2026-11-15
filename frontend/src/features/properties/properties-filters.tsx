import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PropertiesFilters({
  searchInput,
  onSearchInputChange,
  status,
  onStatusChange,
  city,
  onCityChange,
  cities,
}: {
  searchInput: string
  onSearchInputChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  city: string
  onCityChange: (value: string) => void
  cities: string[]
}) {
  return (
    <div className="mb-4 grid gap-3 md:grid-cols-3">
      <Input
        type="search"
        enterKeyHint="search"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        placeholder="Search properties..."
        aria-label="Search properties"
      />
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger aria-label="Filter by status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Select value={city} onValueChange={onCityChange}>
        <SelectTrigger aria-label="Filter by city">
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All cities</SelectItem>
          {cities.map((cityName) => (
            <SelectItem key={cityName} value={cityName}>
              {cityName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
