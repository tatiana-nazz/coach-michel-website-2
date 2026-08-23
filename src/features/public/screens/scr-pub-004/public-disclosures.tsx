import type { SupportedLocale } from '@/i18n/config';

import {
  getPublicDisclosuresViewModel,
  type PublicDisclosuresContent,
  type PublicDisclosuresCopy,
  type PublicDisclosuresState,
} from './public-disclosures.model';
import styles from './public-disclosures.module.css';

interface PublicDisclosuresBaseProps {
  readonly locale: SupportedLocale;
  readonly copy: PublicDisclosuresCopy;
}

interface PublicDisclosuresReadyProps extends PublicDisclosuresBaseProps {
  readonly state: 'ready';
  readonly content: PublicDisclosuresContent;
}

interface PublicDisclosuresNonReadyProps extends PublicDisclosuresBaseProps {
  readonly state: Exclude<PublicDisclosuresState, 'ready'>;
  readonly content?: PublicDisclosuresContent;
}

export type PublicDisclosuresProps = PublicDisclosuresReadyProps | PublicDisclosuresNonReadyProps;

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function PublicDisclosures(props: PublicDisclosuresProps) {
  const { locale, state, copy, content } = props;
  const viewModel = getPublicDisclosuresViewModel(locale, state, content);
  const showInformation = viewModel.showInformation && content !== undefined;
  const stateMessage = copy.feedback[state];

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-PUB-004"
      data-access-boundary="PUBLIC"
      data-role-visibility="ROL-001"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="public-disclosures-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame}>
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="public-disclosures-title">{copy.title}</h1>
        </header>

        <div className={styles.sequence}>
          <section
            className={styles.region}
            data-region="context-identity"
            aria-labelledby="public-disclosures-context"
          >
            <h2 id="public-disclosures-context">{copy.contextHeading}</h2>
            <p>{showInformation ? content.contextBody : stateMessage}</p>
          </section>

          <section
            className={styles.region}
            data-region="primary-information"
            aria-labelledby="public-disclosures-primary"
          >
            <h2 id="public-disclosures-primary">{copy.primaryHeading}</h2>
            <p>{showInformation ? content.primaryBody : stateMessage}</p>
          </section>

          <section
            className={styles.region}
            data-region="supporting-detail"
            aria-labelledby="public-disclosures-supporting"
          >
            <h2 id="public-disclosures-supporting">{copy.supportingHeading}</h2>
            <p>{showInformation ? content.supportingBody : stateMessage}</p>
          </section>

          <section
            className={styles.region}
            data-region="disclosure-notice"
            aria-labelledby="public-disclosures-disclosure"
          >
            <h2 id="public-disclosures-disclosure">{copy.disclosureHeading}</h2>
            <p>{showInformation ? content.disclosureBody : stateMessage}</p>
          </section>

          <section
            className={styles.region}
            data-region="help-recovery"
            aria-labelledby="public-disclosures-help"
          >
            <h2 id="public-disclosures-help">{copy.helpHeading}</h2>
            <p>{showInformation ? content.helpBody : stateMessage}</p>
          </section>

          <section
            className={styles.feedbackRegion}
            data-region="system-feedback"
            data-presentation-state={state}
            aria-labelledby="public-disclosures-feedback"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="public-disclosures-feedback">{copy.feedbackHeading}</h2>
            <div
              className={`${styles.feedback} ${feedbackToneClass[viewModel.feedbackTone]}`}
              data-feedback-tone={viewModel.feedbackTone}
            >
              <span className={styles.feedbackMarker} aria-hidden="true" />
              <span>{stateMessage}</span>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
