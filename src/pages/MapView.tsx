export default function MapView() {
  return (
    <div className="bg-secondary min-h-screen px-6 sm:px-10 py-8">

      {/* HEADER */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">
          GIS Map & Smart Navigation
        </h1>
        <p className="mt-2 max-w-2xl">
          Explore Jharkhand using interactive GIS maps with routes,
          eco-sensitive zones, nearby attractions, and smart navigation.
        </p>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* LEFT PANEL – CONTROLS */}
        <aside className="bg-white rounded-xl shadow p-5">
          <h2 className="font-bold text-primary mb-4">
            Map Layers
          </h2>

          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              Tourist Destinations
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              Waterfalls
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Trekking Routes
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Eco-Sensitive Zones
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Homestays
            </label>
          </div>

          <hr className="my-4" />

          <h2 className="font-bold text-primary mb-2">
            Legend
          </h2>

          <ul className="space-y-2 text-sm">
            <li>🟢 Tourist Spot</li>
            <li>🔵 Waterfall</li>
            <li>🟠 Trekking Route</li>
            <li>🔴 Eco-Sensitive Area</li>
          </ul>
        </aside>

        {/* MAP AREA */}
        <div className="lg:col-span-2 bg-gray-200 rounded-xl h-[450px] flex items-center justify-center relative">
          <span className="text-gray-600 font-medium">
            GIS MAP (OpenLayers + GeoServer)
          </span>

          {/* MAP OVERLAY BUTTONS */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow p-2 space-y-2">
            <button className="block text-sm px-3 py-1 hover:bg-gray-100 rounded">
              Zoom +
            </button>
            <button className="block text-sm px-3 py-1 hover:bg-gray-100 rounded">
              Zoom −
            </button>
            <button className="block text-sm px-3 py-1 hover:bg-gray-100 rounded">
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT PANEL – INFO */}
        <aside className="bg-white rounded-xl shadow p-5">
          <h2 className="font-bold text-primary mb-3">
            Location Info
          </h2>

          <p className="text-sm text-gray-600">
            Select a destination on the map to view details such as
            description, distance, nearby attractions, and safety alerts.
          </p>

          <div className="mt-4 border rounded-lg p-3 text-sm">
            <p className="font-semibold">Example:</p>
            <p>Name: Netarhat</p>
            <p>District: Latehar</p>
            <p>Category: Hill Station</p>
            <p>Nearby: Upper Ghaghri Falls</p>
          </div>

          <button className="mt-4 w-full bg-accent text-white py-2 rounded-lg">
            Get Directions
          </button>
        </aside>
      </div>

      {/* FOOT NOTE */}
      <p className="mt-8 text-sm text-center text-gray-600">
        * GIS data powered by GeoServer and OpenLayers (to be integrated).
      </p>
    </div>
  )
}
