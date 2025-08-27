import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Ahmed Al Maktoum',
    title: 'Groom-to-be',
    quote: 'The virtual trial was a game-changer! I found the perfect sherwani for my wedding without leaving home. The quality in person is even better.',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    rating: 5,
  },
  {
    name: 'David Chen',
    title: 'Event Attendee',
    quote: 'Impeccable service and an exquisite collection. The royal blue blazer I bought is my new favorite. It feels and looks incredibly luxurious.',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    rating: 5,
  },
  {
    name: 'Fatima Al Futtaim',
    title: 'Wedding Planner',
    quote: 'I always recommend Dubai Royal Attire to my clients. Their attention to detail and craftsmanship is unparalleled in the city.',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d',
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="about" className="py-16 sm:py-24 bg-secondary">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold">What Our Patrons Say</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
            Crafting memorable experiences, one outfit at a time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card flex flex-col">
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-accent fill-accent" />
                    ))}
                </div>
                <p className="text-muted-foreground italic flex-grow">&quot;{testimonial.quote}&quot;</p>
                <div className="mt-4 flex items-center">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
