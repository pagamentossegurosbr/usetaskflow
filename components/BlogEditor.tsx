'use client';

import { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Table as TableIcon, 
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface BlogEditorProps {
  initialContent?: string;
  onContentChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const setLink = useCallback(() => {
    if (linkUrl === '') return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const setImage = useCallback(() => {
    if (imageUrl === '') return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setShowImageInput(false);
  }, [editor, imageUrl]);

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-3">
      {/* Primeira linha - Formatação básica */}
      <div className="flex flex-wrap items-center gap-1 mb-3">
        <div className="flex items-center gap-1 mr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('underline') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Sublinhado (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('strike') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Tachado"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-600 mx-2"></div>

        {/* Cabeçalhos */}
        <div className="flex items-center gap-1 mr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-8 px-2 text-xs ${editor.isActive('heading', { level: 1 }) ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Título 1"
          >
            H1
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-8 px-2 text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Título 2"
          >
            H2
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`h-8 px-2 text-xs ${editor.isActive('heading', { level: 3 }) ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Título 3"
          >
            H3
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-600 mx-2"></div>

        {/* Listas */}
        <div className="flex items-center gap-1 mr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Lista não ordenada"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Lista ordenada"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('blockquote') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Citação"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-600 mx-2"></div>

        {/* Alinhamento */}
        <div className="flex items-center gap-1 mr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'left' }) ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'center' }) ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Centralizar"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'right' }) ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Alinhar à direita"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-600 mx-2"></div>

        {/* Links e Mídia */}
        <div className="flex items-center gap-1 mr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkInput(!showLinkInput)}
            className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            title="Inserir link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImageInput(!showImageInput)}
            className="h-8 w-8 p-0 text-gray-300 hover:bg-gray-700"
            title="Inserir imagem"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addTable}
            className="h-8 w-8 p-0 text-gray-300 hover:bg-gray-700"
            title="Inserir tabela"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-600 mx-2"></div>

        {/* Desfazer/Refazer */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            title="Refazer (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Inputs para link e imagem */}
      {showLinkInput && (
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Digite a URL do link..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') setLink();
            }}
          />
          <Button onClick={setLink} size="sm" className="bg-purple-600 hover:bg-purple-700">
            Adicionar
          </Button>
          <Button onClick={() => setShowLinkInput(false)} size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showImageInput && (
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Digite a URL da imagem..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') setImage();
            }}
          />
          <Button onClick={setImage} size="sm" className="bg-purple-600 hover:bg-purple-700">
            Adicionar
          </Button>
          <Button onClick={() => setShowImageInput(false)} size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default function BlogEditor({ initialContent = '', onContentChange, onImageUpload }: BlogEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-400 hover:text-purple-300 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[500px] p-6 prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-em:text-gray-300 prose-blockquote:border-l-purple-500 prose-blockquote:bg-gray-700/50 prose-blockquote:p-4 prose-blockquote:rounded-r prose-code:bg-gray-700 prose-code:text-purple-300 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-700 prose-pre:border prose-pre:border-gray-600 prose-li:text-gray-300 prose-ul:text-gray-300 prose-ol:text-gray-300',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && isMounted && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, isMounted, initialContent]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImageUpload) return;

    try {
      const imageUrl = await onImageUpload(file);
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      toast.success('Imagem adicionada com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem');
    }
  }, [editor, onImageUpload]);

  if (!isMounted) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Editor de Conteúdo</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-700 bg-gray-800">
            <Label htmlFor="image-upload" className="text-white text-sm font-medium mb-2 block">
              Upload de Imagem para o Conteúdo
            </Label>
            <div className="flex gap-2">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="bg-gray-700 border-gray-600 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-3 file:py-2 file:text-sm file:hover:bg-purple-700"
              />
            </div>
          </div>
          <div className="bg-gray-800 min-h-[500px] p-4 flex items-center justify-center">
            <div className="text-gray-400 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
              Carregando editor...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">Editor de Conteúdo</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <MenuBar editor={editor} />
        
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <Label htmlFor="image-upload" className="text-white text-sm font-medium mb-2 block">
            Upload de Imagem para o Conteúdo
          </Label>
          <div className="flex gap-2">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="bg-gray-700 border-gray-600 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-3 file:py-2 file:text-sm file:hover:bg-purple-700"
            />
          </div>
        </div>

        <div className="bg-gray-800 min-h-[500px]">
          <EditorContent editor={editor} />
        </div>
      </CardContent>
    </Card>
  );
}
