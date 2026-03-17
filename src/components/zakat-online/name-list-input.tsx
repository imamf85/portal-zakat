'use client';

import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NameListInputProps {
  names: string[];
  onChange: (names: string[]) => void;
  maxNames: number;
}

export function NameListInput({ names, onChange, maxNames }: NameListInputProps) {
  const handleAddName = () => {
    if (names.length < maxNames) {
      onChange([...names, '']);
    }
  };

  const handleRemoveName = (index: number) => {
    const newNames = names.filter((_, i) => i !== index);
    onChange(newNames);
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    onChange(newNames);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Daftar Nama ({names.length}/{maxNames} jiwa)
        </label>
        {names.length < maxNames && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddName}
            className="text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Tambah
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {names.map((name, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder={`Nama jiwa ke-${index + 1}`}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#599E6E] focus:border-transparent"
            />
            {names.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveName(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {names.length === 0 && (
        <button
          type="button"
          onClick={handleAddName}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#599E6E] hover:text-[#599E6E] transition-colors text-sm"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Tambah nama jiwa pertama
        </button>
      )}

      <p className="text-xs text-gray-500">
        Masukkan nama lengkap setiap jiwa yang akan dizakatkan
      </p>
    </div>
  );
}
