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
        
        <div className="space-y-3">
          {pictures.map(picture => (
            <div 
              key={picture.id} 
              className="group cursor-pointer border border-border rounded-lg hover:border-primary/50 transition-colors bg-card p-3"
              onClick={() => onPictureClick?.(picture)}
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={picture.imageUrl} 
                    alt={picture.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1 truncate">{picture.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{picture.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>;
};