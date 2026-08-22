import type { SupportedLocale } from '@/i18n/config';

import {
  getPublicOverviewViewModel,
  type PublicOverviewContent,
  type PublicOverviewCopy,
  type PublicOverviewState,
} from './public-overview.model';
import styles from './public-overview.module.css';

interface PublicOverviewBaseProps {
  readonly locale: SupportedLocale;
  readonly copy: PublicOverviewCopy;
}

interface PublicOverviewReadyProps extends PublicOverviewBaseProps {
  readonly state: 'ready';
  readonly content: PublicOverviewContent;
}

interface PublicOverviewNonReadyProps extends PublicOverviewBaseProps {
  readonly state: Exclude<PublicOverviewState, 'ready'>;
  readonly content?: PublicOverviewContent;
}

export type PublicOverviewProps = PublicOverviewReadyProps | PublicOverviewNonReadyProps;

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function PublicOverview(props: PublicOverviewProps) {
  const { locale, state, copy, content } = props;
  const viewModel = getPublicOverviewViewModel(locale, state, content);
  const showInformation = viewModel.showInformation && content !== undefined;

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-PUB-001"
      data-access-boundary="PUBLIC"
      data-role-visibility="ROL-001"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="public-overview-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame}>
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="public-overview-title">{copy.title}</h1>
        </header>

        <div className={styles.sequence}>
          <section
            className={styles.region}
            data-region="context-identity"
            aria-labelledby="public-overview-identity"
          >
            <h2 id="public-overview-identity">{copy.identityHeading}</h2>
            <p>{copy.identityBody}</p>
            <h3>{copy.publicBoundaryHeading}</h3>
            <p>{copy.publicBoundaryBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="primary-information"
            aria-labelledby="public-overview-primary"
          >
            <h2 id="public-overview-primary">{copy.primaryHeading}</h2>
            {showInformation ? (
              <>
                <p>{content.purposeBody}</p>
                <h3>{copy.audienceHeading}</h3>
                <p>{content.audienceBody}</p>
              </>
            ) : (
              <p className={styles.stateMessage}>{copy.feedback[state]}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="supporting-detail"
            aria-labelledby="public-overview-supporting"
          >
            <h2 id="public-overview-supporting">{copy.supportingHeading}</h2>
            <p>{showInformation ? content.supportingBody : copy.feedback[state]}</p>
          </section>

          <section
            className={styles.region}
            data-region="disclosure-notice"
            aria-labelledby="public-overview-disclosure"
          >
            <h2 id="public-overview-disclosure">{copy.disclosureHeading}</h2>
            <p>{copy.disclosureBody}</p>
          </section>

          <section
            className={styles.region}
            data-region="help-recovery"
            aria-labelledby="public-overview-help"
          >
            <h2 id="public-overview-help">{copy.helpHeading}</h2>
            <p>{copy.helpBody}</p>
          </section>

          <section
            className={styles.feedbackRegion}
            data-region="system-feedback"
            data-presentation-state={state}
            aria-labelledby="public-overview-feedback"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="public-overview-feedback">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{copy.feedback[state]}</span>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
