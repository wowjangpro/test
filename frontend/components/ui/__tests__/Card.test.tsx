import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from '../Card';

describe('Card 컴포넌트', () => {
  it('자식 요소가 렌더링된다', () => {
    render(
      <Card>
        <div>카드 내용</div>
      </Card>
    );
    expect(screen.getByText('카드 내용')).toBeInTheDocument();
  });

  it('onClick이 제공되면 클릭 가능하다', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Card onClick={handleClick}>
        <div>클릭 가능한 카드</div>
      </Card>
    );

    const card = screen.getByText('클릭 가능한 카드').parentElement;
    await user.click(card!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('onClick이 없으면 cursor-pointer 클래스가 없다', () => {
    render(
      <Card>
        <div>일반 카드</div>
      </Card>
    );

    const card = screen.getByText('일반 카드').parentElement;
    expect(card).not.toHaveClass('cursor-pointer');
  });

  it('onClick이 있으면 cursor-pointer 클래스가 적용된다', () => {
    render(
      <Card onClick={() => {}}>
        <div>클릭 가능한 카드</div>
      </Card>
    );

    const card = screen.getByText('클릭 가능한 카드').parentElement;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('커스텀 className이 적용된다', () => {
    render(
      <Card className="custom-card">
        <div>커스텀 카드</div>
      </Card>
    );

    const card = screen.getByText('커스텀 카드').parentElement;
    expect(card).toHaveClass('custom-card');
  });
});
