import BlogEditor from '../../BlogEditor';
import { requireBlogAccess } from '../../requireBlogAccess';

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  await requireBlogAccess();
  const { id } = await params;
  return <BlogEditor blogId={id} />;
}
