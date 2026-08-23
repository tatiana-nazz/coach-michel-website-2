import type { SupportedLocale } from '@/i18n/config';

import {
  getPublicCoachingPurposeViewModel,
  type PublicCoachingPurposeContent,
  type PublicCoachingPurposeCopy,
  type PublicCoachingPurposeState,
} from './public-coaching-purpose.model';
import styles from './public-coaching-purpose.module.css';

interface PublicCoachingPurposeBaseProps {
  readonly locale: SupportedLocale;
  readonly copy: PublicCoachingPurposeCopy;
}

interface PublicCoachingPurposeReadyProps extends PublicCoachingPurposeBaseProps {
  readonly state: 'ready';
  readonly content: PublicCoachingPurposeContent;
}

interface PublicCoachingPurposeNonReadyProps extends PublicCoachingPurposeBaseProps {
  readonly state: Exclude<PublicCoachingPurposeState, 'ready'>;
  readonly content?: PublicCoachingPurposeContent;
}

export type PublicCoachingPurposeProps =
  | PublicCoachingPurposeReadyProps
  | PublicCoachingPurposeNonReadyProps;

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function PublicCoachingPurpose(props: PublicCoachingPurposeProps) {
  const { locale, state, copy, content } = props;
  const viewModel = getPublicCoachingPurposeViewModel(locale, state, content);
  const showInformation = viewModel.showInformation && content !== undefined;
  const stateMessage = copy.feedback[state];

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-PUB-002"
      data-access-boundary="PUBLIC"
      data-role-visibility="ROL-001"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="public-coaching-purpose-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame}>
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="public-coaching-purpose-title">{copy.title}</h1>
        </header>

        <div className={styles.sequence}>
          <section
            className={styles.region}
            data-region="context-identity"
            aria-labelledby="public-coaching-purpose-context"
          >
            <h2 id="public-coaching-purpose-context">{copy.contextHeading}</h2>
            <p>{showInformation ? content.contextBody : stateMessage}</p>
          </section>

          <section
            className={styles.region}
            data-region="primary-information"
            aria-labelledby="public-coaching-purpose-primary"
          >
            <h2 id="public-coaching-purpose-primary">{copy.primaryHeading}</h2>
            <p>{showInformation ? content.primaryBody : stateMessage}</p>
          </section>

          <section
            className={styles.region}
            data-region="supporting-detail"
            aria-labelledby="public-coaching-purpose-supporting"
          >
            <h2 id="public-coaching-purpose-supporting">{copy.supportingHeading}</h2>
            <p>{showInformation ? content.supportingBody : stateMessage}</p>
          </section>

          <section
            className={styles.region}
            data-region="disclosure-notice"
            aria-labelledby="public-coaching-purpose-disclosure"
          >
            <h2 id="public-coaching-purpose-disclosure">{copy.disclosureHeading}</h2>
            <p>{showInformation ? content.disclosureBody : stateMessage}</p>
          </section>

          <section
            className={styles.region}
            data-region="help-recovery"
            aria-labelledby="public-coaching-purpose-help"
          >
            <h2 id="public-coaching-purpose-help">{copy.helpHeading}</h2>
            <p>{showInformation ? content.helpBody : stateMessage}</p>
          </section>

          <section
            className={styles.feedbackRegion}
            data-region="system-feedback"
            data-presentation-state={state}
            aria-labelledby="public-coaching-purpose-feedback"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="public-coaching-purpose-feedback">{copy.feedbackHeading}</h2>
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
