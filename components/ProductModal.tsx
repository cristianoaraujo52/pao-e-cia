
import React, { useState, useRef } from 'react';
import { Product, ProductCategory } from '../types';
import { imageToBase64 } from '../services/storage';

interface ProductModalProps {
    product?: Product | null;
    onSave: (product: Omit<Product, 'id'> & { id?: string }) => void;
    onClose: () => void;
    isOpen: boolean;
}

const CATEGORIES: { id: ProductCategory; name: string; icon: string }[] = [
    { id: 'pães', name: 'Pães', icon: '🥖' },
    { id: 'doces', name: 'Doces', icon: '🧁' },
    { id: 'salgados', name: 'Salgados', icon: '🥯' },
    { id: 'bebidas', name: 'Bebidas', icon: '☕' },
];

const ProductModal: React.FC<ProductModalProps> = ({ product, onSave, onClose, isOpen }) => {
    const [name, setName] = useState(product?.name || '');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.price?.toString() || '');
    const [category, setCategory] = useState<ProductCategory>(product?.category || 'pães');
    const [rating, setRating] = useState(product?.rating?.toString() || '5');
    const [image, setImage] = useState(product?.image || '');
    const [imagePreview, setImagePreview] = useState(product?.image || '');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsLoading(true);
            try {
                const base64 = await imageToBase64(file);
                setImage(base64);
                setImagePreview(base64);
            } catch (error) {
                console.error('Erro ao carregar imagem:', error);
            }
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || !price || !image) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        onSave({
            id: product?.id,
            name,
            description,
            price: parseFloat(price),
            category,
            rating: parseFloat(rating),
            image,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
            <div className="bg-background-light dark:bg-background-dark w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slideUp">
                {/* Header */}
                <div className="sticky top-0 bg-background-light dark:bg-background-dark p-4 border-b border-warm-accent/10 flex justify-between items-center">
                    <h2 className="text-xl font-extrabold text-[#1d180c] dark:text-white">
                        {product ? 'Editar Produto' : 'Novo Produto'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="size-10 rounded-full bg-warm-accent/10 flex items-center justify-center text-warm-accent hover:bg-warm-accent/20 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-bold text-[#1d180c] dark:text-white mb-2 uppercase tracking-wider">
                            Imagem do Produto *
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-warm-accent/30 rounded-2xl p-4 cursor-pointer hover:border-primary/50 transition-colors text-center bg-white dark:bg-[#383330]"
                        >
                            {imagePreview ? (
                                <div className="relative">
                                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                                    <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <span className="text-white font-bold">Clique para alterar</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8">
                                    <span className="material-symbols-outlined text-5xl text-warm-accent/40 mb-2">add_photo_alternate</span>
                                    <p className="text-warm-accent font-medium">Clique para adicionar imagem</p>
                                    <p className="text-sm text-warm-accent/60">JPG, PNG ou GIF</p>
                                </div>
                            )}
                            {isLoading && <div className="mt-2 text-primary">Carregando...</div>}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-[#1d180c] dark:text-white mb-2 uppercase tracking-wider">
                            Nome do Produto *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Pão Francês Crocante"
                            className="w-full h-12 px-4 rounded-xl border-2 border-warm-accent/20 bg-white dark:bg-[#383330] focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-[#1d180c] dark:text-white mb-2 uppercase tracking-wider">
                            Descrição *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva o produto..."
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border-2 border-warm-accent/20 bg-white dark:bg-[#383330] focus:ring-2 focus:ring-primary outline-none resize-none"
                            required
                        />
                    </div>

                    {/* Price and Category */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-bold text-[#1d180c] dark:text-white mb-2 uppercase tracking-wider">
                                Preço (R$) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0,00"
                                className="w-full h-12 px-4 rounded-xl border-2 border-warm-accent/20 bg-white dark:bg-[#383330] focus:ring-2 focus:ring-primary outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#1d180c] dark:text-white mb-2 uppercase tracking-wider">
                                Categoria *
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                                className="w-full h-12 px-4 rounded-xl border-2 border-warm-accent/20 bg-white dark:bg-[#383330] focus:ring-2 focus:ring-primary outline-none"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-bold text-[#1d180c] dark:text-white mb-2 uppercase tracking-wider">
                            Avaliação
                        </label>
                        <div className="flex items-center gap-3 bg-white dark:bg-[#383330] p-3 rounded-xl border-2 border-warm-accent/20">
                            <input
                                type="range"
                                min="1"
                                max="5"
                                step="0.1"
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                className="flex-grow accent-primary"
                            />
                            <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-lg">
                                <span className="material-symbols-outlined text-primary text-sm fill-1">star</span>
                                <span className="font-bold text-primary">{parseFloat(rating).toFixed(1)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 pb-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-xl font-bold bg-warm-accent/10 text-warm-accent hover:bg-warm-accent/20 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] h-14 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">save</span>
                            {product ? 'Salvar' : 'Adicionar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
