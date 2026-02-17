'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Search,
    Plus,
    Book,
    FileText,
    Share2,
    MessageSquare,
    Lightbulb,
    Edit,
    Trash,
    Loader2
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { storage } from '@/lib/storage'

interface Document {
    id: string
    title: string
    category: string
    updated: string
    author: string
    content: string
}

export default function WorkspacePage() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // CRUD State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingDoc, setEditingDoc] = useState<Document | null>(null)
    const [formData, setFormData] = useState<Partial<Document>>({
        title: '',
        category: 'Standard Ops',
        content: '',
        author: 'Admin'
    })

    // Mock initial data if empty
    useEffect(() => {
        const loadDocs = async () => {
            // In a real app we'd fetch from API
            // For now using local state since we don't have a workspace API yet
            const saved = localStorage.getItem('workspace_docs')
            if (saved) {
                setDocuments(JSON.parse(saved))
            } else {
                const initial = [
                    { id: '1', title: 'Wedding Event SOP', category: 'Standard Ops', updated: '2 days ago', author: 'Admin', content: 'Detailed Wedding SOP...' },
                    { id: '2', title: 'Sound Setup Guide', category: 'Technical', updated: '5 days ago', author: 'Crew-Lead', content: 'Audio configuration...' },
                ]
                setDocuments(initial)
                localStorage.setItem('workspace_docs', JSON.stringify(initial))
            }
            setLoading(false)
        }
        loadDocs()
    }, [])

    const saveDocs = (newDocs: Document[]) => {
        setDocuments(newDocs)
        localStorage.setItem('workspace_docs', JSON.stringify(newDocs))
    }

    const handleSave = () => {
        if (!formData.title) return toast.error('Title is required')

        if (editingDoc) {
            const updated = documents.map(d => d.id === editingDoc.id ? { ...d, ...formData, updated: 'Just now' } as Document : d)
            saveDocs(updated)
            toast.success('Document updated')
        } else {
            const newDoc: Document = {
                ...formData as Document,
                id: Date.now().toString(),
                updated: 'Just now'
            }
            saveDocs([...documents, newDoc])
            toast.success('Document created')
        }
        setIsDialogOpen(false)
    }

    const handleDelete = (id: string) => {
        if (!confirm('Delete this document?')) return
        saveDocs(documents.filter(d => d.id !== id))
        toast.success('Document deleted')
    }

    const openEdit = (doc: Document) => {
        setEditingDoc(doc)
        setFormData(doc)
        setIsDialogOpen(true)
    }

    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading workspace...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Team Workspace</h2>
                    <p className="text-muted-foreground">Collaborate on SOPs, guides, and creative ideas.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingDoc(null); setFormData({ category: 'Standard Ops', author: 'Admin' }) }} className="bg-primary text-background font-bold">
                            <Plus className="mr-2 h-4 w-4" /> Create Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-dark border-white/10 sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingDoc ? 'Edit Document' : 'Create New Document'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                    placeholder="Enter document title"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Standard Ops">Standard Ops</SelectItem>
                                            <SelectItem value="Technical">Technical</SelectItem>
                                            <SelectItem value="Service">Service</SelectItem>
                                            <SelectItem value="Creative">Creative</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Author</Label>
                                    <Input
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Content Summary</Label>
                                <textarea
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Write your guide or SOP here..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave} className="w-full bg-primary text-background font-bold">
                                {editingDoc ? 'Update Document' : 'Publish Document'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="glass-dark border-white/5 md:col-span-1 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold opacity-70">Category Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start text-xs hover:bg-white/5 text-primary font-bold">
                            <Book className="mr-2 h-3.5 w-3.5" /> All Documents
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-xs hover:bg-white/5">
                            <FileText className="mr-2 h-3.5 w-3.5" /> Standard Ops (SOPs)
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-xs hover:bg-white/5 text-orange-400">
                            <Lightbulb className="mr-2 h-3.5 w-3.5" /> Creative Hub
                        </Button>
                    </CardContent>
                </Card>

                <div className="md:col-span-3 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search workspace documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border-white/10 pl-10 h-11"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {filteredDocs.map((doc) => (
                            <Card key={doc.id} className="glass-dark border-white/5 hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="text-[10px] border-primary/20 text-primary py-0 px-2 h-5">{doc.category}</Badge>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEdit(doc) }}>
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); handleDelete(doc.id) }}>
                                                <Trash className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg mt-3 font-bold group-hover:text-primary transition-colors">{doc.title}</CardTitle>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                                        {doc.content || "Click to see document content and guidelines for the team."}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-4 pt-4 border-t border-white/5">
                                        <span>BY {doc.author}</span>
                                        <span>{doc.updated}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {filteredDocs.length === 0 && (
                            <div className="col-span-2 py-20 text-center border border-dashed border-white/10 rounded-3xl">
                                <p className="text-muted-foreground">No documents found in workspace.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
