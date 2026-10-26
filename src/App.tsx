import { useState, useEffect } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { CalendarDays, LogOut, Plus, MessageSquare, Trash2, Edit2, Check, Moon, Sun, ArrowRight } from 'lucide-react';
import type { User as UserType, Note } from '@/types';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot
} from "firebase/firestore";

import { db } from "@/lib/firebase";

// Neutral interface colors
const ACCENT_COLOR = 'var(--action)';
const ACCENT_HOVER = 'var(--action-hover)';

// Public demo account
const DEMO_USER: UserType = {
  id: 'demo',
  email: 'test@notes.com',
  name: 'Test',
  password: 'Test1234',
};


function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Check for saved session on mount
  useEffect(() => {
    for (const key of ['theme', 'current_user']) {
      const legacyKey = `ibis_${key}`;
      const savedValue = localStorage.getItem(legacyKey);
      if (savedValue !== null) {
        if (localStorage.getItem(`notes_${key}`) === null) {
          localStorage.setItem(`notes_${key}`, savedValue);
        }
        localStorage.removeItem(legacyKey);
      }
    }
    const savedTheme = localStorage.getItem('notes_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    const savedUser = localStorage.getItem('notes_current_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.id === DEMO_USER.id && user.email === DEMO_USER.email && user.password === DEMO_USER.password) {
          setCurrentUser(DEMO_USER);
        } else {
          localStorage.removeItem('notes_current_user');
        }
      } catch {
        localStorage.removeItem('notes_current_user');
      }
    }
  }, []);

  const toggleTheme = () => {
  const newTheme = !darkMode;
  setDarkMode(newTheme);

  if (newTheme) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('notes_theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('notes_theme', 'light');
  }
};

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = email === DEMO_USER.email && password === DEMO_USER.password ? DEMO_USER : null;
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('notes_current_user', JSON.stringify(user));
      toast.success(`Bienvenue, ${user.name} !`);
    } else {
      toast.error('Email ou mot de passe incorrect');
    }
  };

  useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "notes"), (snapshot) => {
    const notesData: Note[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();

      return {
        id: docSnap.id,
        content: data.content,
        date: data.date,
        userId: data.userId,
        userName: data.userName,
        createdAt: data.createdAt,
        done: data.done ?? false,
      };
    });

    setNotes(notesData);
  });

  return () => unsubscribe();
}, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('notes_current_user');
    setEmail('');
    setPassword('');
    toast.info('Déconnexion réussie');
  };

const handleAddNote = async () => {
  if (!newNoteContent.trim() || !currentUser) return;

  await addDoc(collection(db, "notes"), {
    content: newNoteContent.trim(),
    date: selectedDate.toISOString(),
    userId: currentUser.id,
    userName: currentUser.name,
    createdAt: new Date().toISOString(),
    done: false,
  });

  setNewNoteContent('');
  setIsAddDialogOpen(false);
  toast.success('Note ajoutée avec succès');
};

const handleDeleteNote = async (noteId: string) => {
  await deleteDoc(doc(db, "notes", noteId));
  toast.success('Note supprimée');
};

const handleSaveEdit = async () => {
  if (!editingNoteId || !editContent.trim()) return;

  try {
    const noteRef = doc(db, "notes", editingNoteId);

    await updateDoc(noteRef, {
      content: editContent.trim(),
    });

    setEditingNoteId(null);
    setEditContent('');
    toast.success("Note modifiée avec succès");
  } catch (error) {
    console.error("Update error:", error);
    toast.error("Erreur lors de la modification");
  }
};

const handleToggleDone = async (noteId: string) => {
  const note = notes.find(n => n.id === noteId);
  if (!note) return;

  try {
    await updateDoc(doc(db, "notes", noteId), {
      done: !note.done,
    });

    toast.success("Statut mis à jour");
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de la mise à jour");
  }
};

  const getNotesForDate = (date: Date) => {
    return notes.filter(note => isSameDay(parseISO(note.date), date));
  };

  const getDatesWithNotes = () => {
    return notes.map(note => parseISO(note.date));
  };
const handleEditNote = (note: Note) => {
  setEditingNoteId(note.id);
  setEditContent(note.content);
};
  // Login Screen
  if (!currentUser) {
    return (
      <div className="login-shell min-h-screen flex items-center justify-center p-4">
        <Card className="login-card w-full max-w-md">
          <CardHeader className="space-y-5 pb-8">
            <div>
              <p className="eyebrow mb-4">VOTRE ESPACE PARTAGÉ</p>
              <CardTitle className="text-3xl font-semibold tracking-tight text-gray-900">
                Notes d’équipe
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Espace de travail partagé</p>
            </div>
            <div className="pt-2">
              <h2 className="text-lg font-semibold text-gray-700">Espace Personnel</h2>
              <p className="text-sm text-gray-500">Connectez-vous pour accéder aux notes</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  placeholder="votre@email.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mot de passe</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-white font-semibold"
                style={{ backgroundColor: ACCENT_COLOR }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ACCENT_HOVER}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ACCENT_COLOR}
              >
                Se connecter <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </form>
            <div className="demo-panel mt-6 border p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Compte de démonstration</p>
              <p className="mt-1">Utilisez ce compte pour découvrir le site.</p>
              <p className="mt-3">Email : <span className="font-medium text-slate-900">{DEMO_USER.email}</span></p>
              <p>Mot de passe : <span className="font-medium text-slate-900">{DEMO_USER.password}</span></p>
            </div>

          </CardContent>
        </Card>
      </div>
    );
  }

  // Main App Screen
  const selectedDateNotes = getNotesForDate(selectedDate);
  const datesWithNotes = getDatesWithNotes();

  return (
    <div className="app-shell min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="app-header border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900">Notes d’équipe</h1>
                <p className="text-xs text-gray-500">Espace de travail partagé</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                aria-label={darkMode ? "Activer le thème clair" : "Activer le thème sombre"}
                className="text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8" style={{ backgroundColor: ACCENT_COLOR }}>
                  <AvatarFallback className="text-white text-sm" style={{ backgroundColor: ACCENT_COLOR }}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {currentUser.name}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                aria-label="Se déconnecter"
                className="text-gray-500 hover:bg-slate-100"
                style={{ '--hover-color': ACCENT_COLOR } as React.CSSProperties}
              >
                <LogOut className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="workspace-intro mb-8">
          <p className="eyebrow">ESPACE DE TRAVAIL</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">Une équipe, une longueur d’avance.</h2>
          <p className="mt-3 text-sm text-gray-500">Vos notes et vos priorités, au même endroit.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Notes Section - Main focus (8 cols) */}
          <div className="lg:col-span-8">
            <Card className="workspace-card h-full">
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
                    Notes du {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                  </CardTitle>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="text-white"
                        style={{ backgroundColor: ACCENT_COLOR }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Nouvelle note</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Date : {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                          </label>
                        </div>
                        <Textarea
                          placeholder="Écrivez votre note ici..."
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          className="min-h-[120px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsAddDialogOpen(false)}
                          >
                            Annuler
                          </Button>
                          <Button 
                            onClick={handleAddNote}
                            className="text-white"
                            style={{ backgroundColor: ACCENT_COLOR }}
                            disabled={!newNoteContent.trim()}
                          >
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {selectedDateNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
                      <p className="text-center">Aucune note pour cette date</p>
                      <p className="text-sm text-center mt-1">Cliquez sur "Ajouter" pour créer une note</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateNotes.map((note) => (
                        <div 
                          key={note.id} 
                          className={`note-card border p-5 transition-colors ${
                            note.done ? 'border-green-300 bg-green-50' : 'border-gray-200'
                          }`}
                        >
                          {editingNoteId === note.id ? (
                            <div className="space-y-3">
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[80px]"
                              />
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setEditingNoteId(null)}
                                >
                                  Annuler
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  className="text-white"
                                  style={{ backgroundColor: ACCENT_COLOR }}
                                >
                                  Enregistrer
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className={`text-gray-800 whitespace-pre-wrap text-base ${
                                note.done ? 'line-through text-gray-500' : ''
                              }`}>
                                {note.content}
                              </p>
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                      {note.userName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-gray-500">{note.userName}</span>
                                  <span className="text-xs text-gray-400">
                                    {format(parseISO(note.createdAt), 'HH:mm')}
                                  </span>
                                  {note.done && (
                                    <span className="text-xs text-green-600 font-medium">✓ Terminé</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-7 w-7 p-0 hover:bg-green-100 ${
                                      note.done ? 'text-green-600' : 'text-gray-400'
                                    }`}
                                    onClick={() => handleToggleDone(note.id)}
                                    title={note.done ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-gray-400 hover:bg-slate-100"
                                    onClick={() => handleEditNote(note)}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" style={{ color: ACCENT_COLOR }} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-gray-400 hover:bg-slate-100"
                                    onClick={() => handleDeleteNote(note.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" style={{ color: ACCENT_COLOR }} />
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Section - Smaller (4 cols) */}
          <div className="lg:col-span-4">
            <Card className="workspace-card bg-white dark:bg-gray-800 dark:text-gray-100 transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
                  Calendrier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="calendar-wrapper">
                  <Calendar
                    locale={fr}
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="w-full custom-calendar"
                    modifiers={{
                      hasNotes: datesWithNotes,
                    }}
                    modifiersStyles={{
                      hasNotes: {
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        textDecorationColor: ACCENT_COLOR,
                        textDecorationThickness: '3px',
                      },
                    }}
                  />
                </div>
                <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-none" style={{ backgroundColor: ACCENT_COLOR }}></div>
                    <span>Date sélectionnée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-b-3" style={{ borderBottom: `3px solid ${ACCENT_COLOR}` }}></div>
                    <span>Notes disponibles</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Nour. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
