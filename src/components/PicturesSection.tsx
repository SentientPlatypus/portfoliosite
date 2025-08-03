interface Picture {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}
const pictures: Picture[] = [{
  id: '1',
  title: 'Tabling for CRU at Binghampton University',
  description: 'Tabling for CRU at Binghampton University as part of a two day event with some guys from the Cornell CRU',
  imageUrl: 'images/CRU.jpg'
}, {
  id: '2',
  title: 'Code & Coffee',
  description: 'Late night coding sessions',
  imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop'
}, {
  id: '3',
  title: 'Wildlife Photography',
  description: 'Captured in the wilderness',
  imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=300&h=200&fit=crop'
}, {
  id: '4',
  title: 'My Coding Setup',
  description: 'Where the magic happens',
  imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=200&fit=crop'
}];
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