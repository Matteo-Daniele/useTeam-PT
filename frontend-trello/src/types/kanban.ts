export interface Card {
    id: string,
    name: string
    description: string,
}
  
export interface Column {
    id: string,
    title: string,
    cards: Card[],          
}
  
export interface Board {
    id: string,
    name: string,
    columns: Column[],
}  