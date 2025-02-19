import React, { AriaAttributes } from 'react';

import { locale } from '../../lib/locale/decorators';
import { CrossIcon } from '../../internal/icons/CrossIcon';
import { emptyHandler } from '../../lib/utils';
import { ThemeContext } from '../../lib/theming/ThemeContext';
import { Theme } from '../../lib/theming/Theme';
import { CommonProps, CommonWrapper } from '../../internal/CommonWrapper';
import { cx } from '../../lib/theming/Emotion';
import { rootNode, TSetRootNode } from '../../lib/rootNode';
import { isTheme2022 } from '../../lib/theming/ThemeHelpers';
import { CloseButtonIcon } from '../../internal/CloseButtonIcon/CloseButtonIcon';
import { SizeProp } from '../../lib/types/props';
import { reactGetTextContent } from '../../lib/reactGetTextContent';

import { styles, colorStyles } from './Token.styles';
import { TokenLocale, TokenLocaleHelper } from './locale';
import { TokenView } from './TokenView';

export type TokenColorName = keyof typeof colorStyles;

export interface TokenColors {
  idle: TokenColorName;
  active?: TokenColorName;
}

export type TokenSize = SizeProp;

export interface TokenProps extends Pick<AriaAttributes, 'aria-describedby'>, CommonProps {
  colors?: TokenColors;
  isActive?: boolean;
  /**
   * Состояние валидации при ошибке.
   */
  error?: boolean;
  /**
   * Состояние валидации при предупреждении.
   */
  warning?: boolean;
  disabled?: boolean;
  /**
   * Размер
   */
  size?: TokenSize;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
  onRemove?: React.MouseEventHandler<HTMLElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
}

const getValidation = (error: TokenProps['error'], warning: TokenProps['warning']) => {
  if (error) {
    return 'error';
  } else if (warning) {
    return 'warning';
  }

  return null;
};

export const TokenDataTids = {
  root: 'Token__root',
  removeIcon: 'Token__removeIcon',
} as const;

@rootNode
@locale('Token', TokenLocaleHelper)
export class Token extends React.Component<TokenProps> {
  public static __KONTUR_REACT_UI__ = 'Token';
  public static displayName = 'Token';

  private theme!: Theme;
  private setRootNode!: TSetRootNode;
  private readonly locale!: TokenLocale;

  public render() {
    return (
      <ThemeContext.Consumer>
        {(theme) => {
          this.theme = theme;
          return this.renderMain();
        }}
      </ThemeContext.Consumer>
    );
  }

  private renderMain() {
    const {
      size,
      children,
      isActive,
      colors = { idle: 'defaultIdle', active: 'defaultActive' },
      error,
      warning,
      disabled,
      'aria-describedby': ariaDescribedby,
      onClick = emptyHandler,
      onDoubleClick = emptyHandler,
      onMouseEnter = emptyHandler,
      onMouseLeave = emptyHandler,
      onFocus = emptyHandler,
      onBlur = emptyHandler,
    } = this.props;

    const theme = this.theme;

    const validation = getValidation(error, warning);
    const removeButtonAriaLabel = this.locale.removeButtonAriaLabel + ' ' + reactGetTextContent(children);

    const icon = isTheme2022(theme) ? (
      <CloseButtonIcon
        side={16}
        color="inherit"
        colorHover="inherit"
        aria-label={removeButtonAriaLabel}
        tabbable={false}
      />
    ) : (
      <CrossIcon />
    );

    const classNames = isTheme2022(theme)
      ? cx(
          styles.tokenDefaultIdle2022(theme),
          !isActive && !warning && !error && !disabled && styles.tokenDefaultIdleHovering2022(theme),
          isActive && styles.tokenDefaultActive2022(theme),
          warning && styles.tokenWarning2022(theme),
          error && styles.tokenError2022(theme),
          disabled && styles.tokenDisabled2022(theme),
        )
      : cx(
          colorStyles[colors.idle](theme, validation),
          !!isActive && colorStyles[colors.active || colors.idle](theme, validation),
          !!disabled && styles.disabled(theme),
          !!disabled && colorStyles.defaultDisabled(theme),
          !!disabled && warning && colorStyles.defaultDisabledWarning(theme),
          !!disabled && error && colorStyles.defaultDisabledError(theme),
        );

    const textholder = <span className={styles.text(this.theme)}>{children}</span>;

    const closeButton = (
      <span
        role={isTheme2022(theme) ? undefined : 'button'}
        aria-label={isTheme2022(theme) ? undefined : removeButtonAriaLabel}
        onClick={this.onRemoveClick}
        data-tid={TokenDataTids.removeIcon}
      >
        {icon}
      </span>
    );

    return (
      <CommonWrapper rootNodeRef={this.setRootNode} {...this.props}>
        <TokenView
          className={classNames}
          size={size}
          closeButton={closeButton}
          data-tid={TokenDataTids.root}
          aria-describedby={ariaDescribedby}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {textholder}
        </TokenView>
      </CommonWrapper>
    );
  }

  private onRemoveClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const { disabled, onRemove = emptyHandler } = this.props;

    if (disabled) {
      event.preventDefault();
      return;
    }

    onRemove(event);
  };
}
