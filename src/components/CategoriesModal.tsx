import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Trash2, Edit2, Check, Tag } from 'lucide-react';
import { Category } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  'Home',
  'Plane',
  'ShoppingBag',
  'Coffee',
  'Car',
  'Heart',
  'Film',
  'Zap',
  'ShoppingBasket',
  'Gift',
  'Wrench',
  'Utensils',
  'Tag',
  'DollarSign',
];

const AVAILABLE_COLORS = [
  '#0284c7', // Sky
  '#e11d48', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#64748b', // Slate
];

export const CategoriesModal: React.FC<CategoriesModalProps> = ({ isOpen, onClose }) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [newCatColor, setNewCatColor] = useState('#0284c7');
  const [newSubcatInput, setNewSubcatInput] = useState('');
  const [newSubcatsList, setNewSubcatsList] = useState<string[]>([]);

  // Editing existing category state
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editSubcatInputs, setEditSubcatInputs] = useState<{ [catId: string]: string }>({});

  if (!isOpen) return null;

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.iconName);
    setEditColor(cat.color);
  };

  const handleSaveEdit = async (cat: Category) => {
    if (!editName.trim()) return;
    await updateCategory(cat.id, {
      name: editName.trim(),
      iconName: editIcon,
      color: editColor,
    });
    setEditingCatId(null);
  };

  const handleAddSubcatToExisting = async (cat: Category) => {
    const text = (editSubcatInputs[cat.id] || '').trim();
    if (!text) return;
    if (!cat.subcategories.includes(text)) {
      const updated = [...cat.subcategories, text];
      await updateCategory(cat.id, { subcategories: updated });
    }
    setEditSubcatInputs((prev) => ({ ...prev, [cat.id]: '' }));
  };

  const handleRemoveSubcatFromExisting = async (cat: Category, subcatToRemove: string) => {
    const updated = cat.subcategories.filter((s) => s !== subcatToRemove);
    await updateCategory(cat.id, { subcategories: updated });
  };

  const handleCreateNewCategory = async () => {
    if (!newCatName.trim()) return;

    await addCategory({
      name: newCatName.trim(),
      iconName: newCatIcon,
      color: newCatColor,
      subcategories: newSubcatsList.length > 0 ? newSubcatsList : ['Všeobecné'],
      isSystem: false,
    });

    // Reset form
    setNewCatName('');
    setNewCatIcon('Tag');
    setNewCatColor('#0284c7');
    setNewSubcatsList([]);
    setIsAddingNew(false);
  };

  const handleAddSubcatToNew = () => {
    if (!newSubcatInput.trim()) return;
    if (!newSubcatsList.includes(newSubcatInput.trim())) {
      setNewSubcatsList([...newSubcatsList, newSubcatInput.trim()]);
    }
    setNewSubcatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Správa kategórií a podkategórií
            </h2>
            <p className="text-xs text-slate-400">
              Prispôsobte si kategórie výdavkov podľa vašich potrieb.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List & Forms */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Top Button to Add New Category */}
          {!isAddingNew ? (
            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800/60 hover:border-sky-500 text-sky-600 dark:text-sky-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Pridať novú vlastnú kategóriu</span>
            </button>
          ) : (
            /* New Category Creator Card */
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-sky-300 dark:border-sky-700 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Nová kategória
                </span>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Zrušiť
                </button>
              </div>

              <input
                type="text"
                placeholder="Názov kategórie (napr. Domáce zvieratá, Hobby...)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              {/* Color picker */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Farba
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newCatColor === c ? 'scale-125 ring-2 ring-white dark:ring-slate-900' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon picker */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Ikona
                </span>
                <div className="flex gap-2 flex-wrap">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewCatIcon(ic)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        newCatIcon === ic
                          ? 'border-sky-500 bg-sky-100 dark:bg-sky-950 text-sky-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      <CategoryIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Podkategórie
                </span>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Pridať podkategóriu (napr. Veterinár)"
                    value={newSubcatInput}
                    onChange={(e) => setNewSubcatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubcatToNew();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcatToNew}
                    className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl"
                  >
                    Pridať
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {newSubcatsList.map((sub) => (
                    <span
                      key={sub}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      {sub}
                      <button
                        type="button"
                        onClick={() =>
                          setNewSubcatsList(newSubcatsList.filter((s) => s !== sub))
                        }
                        className="text-slate-400 hover:text-rose-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateNewCategory}
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Vytvoriť kategóriu
              </button>
            </div>
          )}

          {/* Existing Categories List */}
          <div className="space-y-3">
            {categories.map((cat) => {
              const isEditing = editingCatId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: isEditing ? editColor : cat.color }}
                      >
                        <CategoryIcon name={isEditing ? editIcon : cat.iconName} className="w-4 h-4" />
                      </div>

                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                        />
                      ) : (
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {cat.name}
                          </h4>
                          {cat.isSystem && (
                            <span className="text-[10px] text-slate-400">Predvolená</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(cat)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!cat.isSystem && (
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Vymazať kategóriu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subcategories Pill Cloud */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                      Podkategórie ({cat.subcategories.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {cat.subcategories.map((sub) => (
                        <span
                          key={sub}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300"
                        >
                          {sub}
                          <button
                            type="button"
                            onClick={() => handleRemoveSubcatFromExisting(cat, sub)}
                            className="text-slate-400 hover:text-rose-500 text-xs ml-0.5"
                            title="Odstrániť podkategóriu"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Quick Add Subcategory Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nová podkategória..."
                        value={editSubcatInputs[cat.id] || ''}
                        onChange={(e) =>
                          setEditSubcatInputs((prev) => ({
                            ...prev,
                            [cat.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubcatToExisting(cat);
                          }
                        }}
                        className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSubcatToExisting(cat)}
                        className="px-2.5 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg active:scale-95 transition-all"
                      >
                        Pridať
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
