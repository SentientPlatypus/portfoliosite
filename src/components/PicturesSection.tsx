interface Picture {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}
const pictures: Picture[] = [{
  id: '1',
  title: 'Graduated!',
  description: 'Picture that was taken of Bel and I before graduation',
  imageUrl: 'images/grad.jpg'
}, {
  id: '2',
  title: 'Tabling for CRU at Binghamton University',
  description: 'Tabling for CRU at Binghamton University as part of a two day event with some guys from the Cornell CRU',
  imageUrl: 'images/CRU.jpg'
}, {
  id: '3',
  title: 'Speaking at the Final round of BigRedHacks',
  description: 'Speaking at the Final round of BigRedHacks about my project LockD',
  imageUrl: 'images/speaking.jpg'
}, {
  id: '4',
  title: 'Trap Shooting',
  description: 'I went shooting with Liam and Arda',
  imageUrl: 'images/trap.jpg'
}, {
  id: '5',
  title: 'GroovyAR DEMO',
  description: 'Demonstrating the GroovyAR device at ASMLxCornell Makeathon',
  imageUrl: 'images/groovyAR_demo.png'
},{
  id: '6',
  title: 'Bellevue Armory',
  description: 'first time shooting 22s',
  imageUrl: 'images/range.jpeg'
},{
  id: '7',
  title: 'Rainier',
  description: 'Rainier Skyline trail',
  imageUrl: 'images/rainier.jpeg'
},
{
  id: '8',
  title: 'Moon Jellies',
  description: 'We probe them in the lab',
  imageUrl: 'images/jelly.jpeg'
},
{
  id: '9',
  title: 'Golden Gardens Beach',
  description: 'cold water',
  imageUrl: 'images/indawater.jpg'
},
{
  id: '10',
  title: 'Snow Lake',
  description: 'kinda gloomy',
  imageUrl: 'images/snowlake.jpeg'
},];
interface PicturesSectionProps {
  onPictureClick?: (picture: {
    id: string;
    title: string;
    imageUrl: string;
  }) => void;
}
export const PicturesSection = ({
  onPictureClick
}: PicturesSectionProps) => {
  return <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-left">Pictures</h2>
          <p className="text-sm text-green-400 font-mono">"🧀"</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pictures.map(picture => <div key={picture.id} className="group cursor-pointer" onClick={() => onPictureClick?.(picture)}>
              <div className="relative overflow-hidden rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                <img src={picture.imageUrl} alt={picture.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1">{picture.title}</h3>
                  <p className="text-xs text-muted-foreground">{picture.description}</p>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
};