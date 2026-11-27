import BlogEditor from '../BlogEditor';
import { requireBlogAccess } from '../requireBlogAccess';

export default async function NewBlogPage() {
  await requireBlogAccess();
  return <BlogEditor />;
}
