import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, ShoppingCart } from "lucide-react"

const books = [
  {
    id: 1,
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    price: "$12.99",
    rating: 4.6,
    image: "/seven-husbands-evelyn-hugo-cover.png",
    category: "Fiction",
    isNew: false,
  },
  {
    id: 2,
    title: "Educated",
    author: "Tara Westover",
    price: "$15.99",
    rating: 4.8,
    image: "/educated-memoir-cover.png",
    category: "Memoir",
    isNew: false,
  },
  {
    id: 3,
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    price: "$13.99",
    rating: 4.5,
    image: "/thursday-murder-club-cover.png",
    category: "Mystery",
    isNew: true,
  },
  {
    id: 4,
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    price: "$16.99",
    rating: 4.3,
    image: "/klara-and-the-sun-inspired-cover.png",
    category: "Literary Fiction",
    isNew: false,
  },
  {
    id: 5,
    title: "The Invisible Life of Addie LaRue",
    author: "V.E. Schwab",
    price: "$14.99",
    rating: 4.7,
    image: "/addie-larue-book-cover.png",
    category: "Fantasy",
    isNew: false,
  },
  {
    id: 6,
    title: "Circe",
    author: "Madeline Miller",
    price: "$13.99",
    rating: 4.9,
    image: "/placeholder-2krvn.png",
    category: "Mythology",
    isNew: false,
  },
  {
    id: 7,
    title: "The Guest List",
    author: "Lucy Foley",
    price: "$11.99",
    rating: 4.4,
    image: "/the-guest-list-thriller-cover.png",
    category: "Thriller",
    isNew: true,
  },
  {
    id: 8,
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    price: "$14.99",
    rating: 4.6,
    image: "/where-the-crawdads-sing-inspired-cover.png",
    category: "Fiction",
    isNew: false,
  },
]

export function BookGrid() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">All Books</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our complete collection of carefully selected titles
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {books.map((book) => (
            <Card
              key={book.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-card border-border"
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={book.image || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {book.isNew && <Badge className="absolute top-3 left-3 bg-orange-500 text-white">New</Badge>}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4">
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {book.category}
                  </Badge>

                  <h3 className="font-serif font-bold text-foreground mb-1 line-clamp-2 group-hover:text-cyan-800 dark:group-hover:text-cyan-300 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">by {book.author}</p>

                  <div className="flex items-center mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-semibold">{book.rating}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">{book.price}</span>
                    <Button
                      size="sm"
                      className="bg-cyan-800 hover:bg-cyan-900 dark:bg-cyan-300 dark:text-slate-900 dark:hover:bg-cyan-200"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-cyan-800 text-cyan-800 hover:bg-cyan-800 hover:text-white dark:border-cyan-300 dark:text-cyan-300 dark:hover:bg-cyan-300 dark:hover:text-slate-900 px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-200 bg-transparent"
          >
            Load More Books
          </Button>
        </div>
      </div>
    </section>
  )
}
