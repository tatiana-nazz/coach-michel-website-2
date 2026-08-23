import type { SupportedLocale } from '@/i18n/config';

import {
  getPublicGuidanceCollectionViewModel,
  type PublicGuidanceCollectionContent,
  type PublicGuidanceCollectionCopy,
  type PublicGuidanceCollectionState,
} from './public-guidance-collection.model';
import styles from './public-guidance-collection.module.css';

interface PublicGuidanceCollectionBaseProps {
  readonly locale: SupportedLocale;
  readonly copy: PublicGuidanceCollectionCopy;
}

interface PublicGuidanceCollectionReadyProps extends PublicGuidanceCollectionBaseProps {
  readonly state: 'ready';
  readonly content: PublicGuidanceCollectionContent;
}

interface PublicGuidanceCollectionNonReadyProps extends PublicGuidanceCollectionBaseProps {
  readonly state: Exclude<PublicGuidanceCollectionState, 'ready'>;
  readonly content?: PublicGuidanceCollectionContent;
}

export type PublicGuidanceCollectionProps =
  | PublicGuidanceCollectionReadyProps
  | PublicGuidanceCollectionNonReadyProps;

const feedbackToneClass = {
  info: styles.feedbackInfo,
  danger: styles.feedbackDanger,
  warning: styles.feedbackWarning,
  success: styles.feedbackSuccess,
} as const;

export function PublicGuidanceCollection(props: PublicGuidanceCollectionProps) {
  const { locale, state, copy, content } = props;
  const viewModel = getPublicGuidanceCollectionViewModel(locale, state, content);
  const showCollection = viewModel.showCollection && content !== undefined;
  const showInformation = state === 'ready' && content !== undefined;
  const stateMessage = copy.feedback[state];

  return (
    <section
      className={styles.screen}
      data-screen-id="SCR-PUB-003"
      data-access-boundary="PUBLIC"
      data-role-visibility="ROL-001"
      data-implementation-stage="P4-S06"
      lang={locale}
      dir={viewModel.direction}
      aria-labelledby="public-guidance-collection-title"
    >
      <div className={styles.frame}>
        <header className={styles.contextFrame}>
          <p className={styles.eyebrow}>{copy.contextLabel}</p>
          <h1 id="public-guidance-collection-title">{copy.title}</h1>
        </header>

        <div className={styles.sequence}>
          <section
            className={styles.region}
            data-region="context-identity"
            aria-labelledby="public-guidance-collection-context"
          >
            <h2 id="public-guidance-collection-context">{copy.contextHeading}</h2>
            <p>{showInformation ? content.contextBody : stateMessage}</p>
          </section>

          <section
            className={styles.region}
            data-region="primary-information"
            aria-labelledby="public-guidance-collection-primary"
          >
            <h2 id="public-guidance-collection-primary">{copy.primaryHeading}</h2>
            {showCollection ? (
              <ul className={styles.collection}>
                {content.items.map((item, index) => (
                  <li
                    className={styles.collectionItem}
                    data-guidance-item
                    key={item.reference ?? `${index}:${item.heading}`}
                  >
                    <article>
                      <h3>{item.heading}</h3>
                      <p>{item.body}</p>
                    </article>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.stateMessage}>{stateMessage}</p>
            )}
          </section>

          <section
            className={styles.region}
            data-region="supporting-detail"
            aria-labelledby="public-guidance-collection-supporting"
          >
            <h2 id="public-guidance-collection-supporting">{copy.supportingHeading}</h2>
            <p>{showInformation ? content.supportingBody : stateMessage}</p>
          </section>

          <section
            className={styles.region}
            data-region="disclosure-notice"
            aria-labelledby="public-guidance-collection-disclosure"
          >
            <h2 id="public-guidance-collection-disclosure">{copy.disclosureHeading}</h2>
            <p>{showInformation ? content.disclosureBody : stateMessage}</p>
          </section>

          <section
            className={styles.region}
            data-region="help-recovery"
            aria-labelledby="public-guidance-collection-help"
          >
            <h2 id="public-guidance-collection-help">{copy.helpHeading}</h2>
            <p>{showInformation ? content.helpBody : stateMessage}</p>
          </section>

          <section
            className={styles.feedbackRegion}
            data-region="system-feedback"
            data-presentation-state={state}
            aria-labelledby="public-guidance-collection-feedback"
            role={viewModel.feedbackRole}
            aria-live={viewModel.feedbackRole === 'status' ? 'polite' : 'assertive'}
          >
            <h2 id="public-guidance-collection-feedback">{copy.feedbackHeading}</h2>
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
