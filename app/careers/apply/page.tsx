import { Suspense } from 'react';
import PageLayout from '@/components/PageLayout';
import CareersHeader from '@/components/careers/CareersHeader';
import ApplyForm from './ApplyForm';
import './apply.css';

// Server component: only ApplyForm needs browser state and useSearchParams.
export default function ApplyPage() {
  return (
    <PageLayout route="careers">
      <div id="content" className="site-content-page clear" tabIndex={-1}>
        <div className="col-fluid">
          <div id="primary" className="content-area">
            <main id="main" className="site-main">
              <div className="vv-careers-apply">
                <CareersHeader />
                <Suspense
                  fallback={
                    <div className="vv-careers-apply__wrapper">
                      <div className="vv-careers-apply__container">
                        <p className="vv-careers-apply__loading" role="status">
                          Loading application form...
                        </p>
                      </div>
                    </div>
                  }
                >
                  <ApplyForm />
                </Suspense>
              </div>
            </main>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
