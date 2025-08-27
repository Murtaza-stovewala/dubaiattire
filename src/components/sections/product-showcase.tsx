'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { products, productFilters, type Product } from '@/lib/products';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProductShowcase = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [category, setCategory] = useState('All');
  const [color, setColor] = useState('All');
  const [occasion, setOccasion] = useState('All');

  const handleFilterChange = (filterType: 'category' | 'color' | 'occasion', value: string) => {
    let newCategory = category;
    let newColor = color;
    let newOccasion = occasion;

    if (filterType === 'category') {
      setCategory(value);
      newCategory = value;
    }
    if (filterType === 'color') {
      setColor(value);
      newColor = value;
    }
    if (filterType === 'occasion') {
      setOccasion(value);
      newOccasion = value;
    }

    let tempProducts = products;

    if (newCategory !== 'All') {
      tempProducts = tempProducts.filter(p => p.category === newCategory);
    }
    if (newColor !== 'All') {
      tempProducts = tempProducts.filter(p => p.color === newColor);
    }
    if (newOccasion !== 'All') {
        tempProducts = tempProducts.filter(p => p.occasion === newOccasion);
    }

    setFilteredProducts(tempProducts);
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(price);
  };


  return (
    <section id="collection" className="py-16 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold">Our Collection</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
            Browse our curated selection of premium men&apos;s wear.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-card rounded-lg border">
          <FilterSelect
            label="Category"
            value={category}
            options={productFilters.category}
            onValueChange={(value) => handleFilterChange('category', value)}
          />
          <FilterSelect
            label="Color"
            value={color}
            options={productFilters.color}
            onValueChange={(value) => handleFilterChange('color', value)}
          />
          <FilterSelect
            label="Occasion"
            value={occasion}
            options={productFilters.occasion}
            onValueChange={(value) => handleFilterChange('occasion', value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={product.imageSrc}
                    alt={product.name}
                    data-ai-hint={product.imageHint}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-headline text-xl font-semibold truncate">{product.name}</h3>
                  <p className="text-muted-foreground text-sm">{product.category}</p>
                  <p className="font-semibold text-lg text-primary">{formatPrice(product.price)}</p>
                  <Button asChild className="w-full bg-primary hover:bg-accent hover:text-accent-foreground">
                    <Link href={`/virtual-trial/${product.id}`}>Try Virtually</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

type FilterSelectProps = {
  label: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
};

const FilterSelect = ({ label, value, options, onValueChange }: FilterSelectProps) => (
    <div className="flex-1">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">{label}</label>
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-full">
            <SelectValue placeholder={`Filter by ${label}`} />
            </SelectTrigger>
            <SelectContent>
            {options.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
            </SelectContent>
        </Select>
    </div>
);


export default ProductShowcase;
