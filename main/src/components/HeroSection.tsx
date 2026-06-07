import { Phone, MapPin } from 'lucide-react'

export default function HeroSection() {
  return (
    <section style={{ backgroundColor: '#b91c1c' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest opacity-75 mb-2">Welcome to</p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Garg Electrical<br />
              <span className="opacity-90">and Engineering Works</span>
            </h2>
            <p className="text-base opacity-85 mb-6 leading-relaxed">
              Machinery Parts
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 opacity-80" />
                <p className="text-sm opacity-90">
                  4201 (old-3453), Hansapuri main Road,<br />Tri-Nagar, Delhi-110035
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 opacity-80" />
                <a href="tel:+919899303030" className="text-sm opacity-90 hover:opacity-100 transition-opacity">
                  +91 98993 03030
                </a>
              </div>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden shadow-2xl h-64 md:h-80">
            <iframe
              src="https://maps.google.com/maps?q=28.67749407377176,77.15622196536829&output=embed&z=17"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="GARG ELECTRICAL AND ENGINEERING WORKS location"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
