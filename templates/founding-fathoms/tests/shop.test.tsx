import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CART_STORAGE_KEY } from '../src/lib/cart';
import type { FormSender } from '../src/lib/forms';
import { CanClubSignup } from '../src/sections/contact/CanClubSignup';
import { Checkout } from '../src/sections/shop/Checkout';
import { renderSite, renderWith } from './render';

const fakeSender = (kind: 'sent' | 'failed'): FormSender & { send: ReturnType<typeof vi.fn> } => ({
  mode: 'live',
  send: vi.fn(() =>
    Promise.resolve(
      kind === 'sent' ? { kind: 'sent' as const } : { kind: 'failed' as const, message: 'Something went wrong on our side.' },
    ),
  ),
});

const saveCart = (items: { id: string; quantity: number }[]) => window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));

describe('the shop', () => {
  it('groups the products and adds them to the cart, saying how many are in it', async () => {
    const user = userEvent.setup();
    renderSite('/shop');
    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .slice(0, 4)
        .map((heading) => heading.textContent),
    ).toEqual(['Four-packs', 'Apparel', 'Glassware', 'Gear']);
    const add = screen.getByRole('button', { name: 'Add to cart: Fog Bank Hazy' });
    await user.click(add);
    await user.click(add);
    expect(screen.getByText('2 in your cart')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cart, 2 items' })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]')).toEqual([{ id: 'fog-bank-4', quantity: 2 }]);
  });

  it('picks up the cart saved in this browser', () => {
    saveCart([
      { id: 'work-cap', quantity: 1 },
      { id: 'keel-line-4', quantity: 3 },
    ]);
    renderSite('/');
    expect(screen.getByRole('button', { name: 'Cart, 4 items' })).toBeInTheDocument();
  });

  it('opens the cart, changes quantities, removes items and links to checkout', async () => {
    const user = userEvent.setup();
    saveCart([
      { id: 'work-cap', quantity: 1 },
      { id: 'keel-line-4', quantity: 2 },
    ]);
    renderSite('/');
    await user.click(screen.getByRole('button', { name: 'Cart, 3 items' }));
    const cart = screen.getByRole('dialog', { name: 'Your cart' });
    expect(cart).toHaveAttribute('open');
    expect(within(cart).getByText('$58.00')).toBeInTheDocument();
    await user.click(within(cart).getByRole('button', { name: 'One more Work Cap' }));
    expect(within(cart).getByText('$86.00')).toBeInTheDocument();
    await user.click(within(cart).getByRole('button', { name: 'Remove Keel Line Lager' }));
    expect(within(cart).queryByText('Keel Line Lager')).toBeNull();
    await user.click(within(cart).getByRole('button', { name: 'One fewer Work Cap' }));
    await user.click(within(cart).getByRole('button', { name: 'One fewer Work Cap' }));
    expect(within(cart).getByText(/Your cart is empty/)).toBeInTheDocument();
    await user.click(within(cart).getByRole('button', { name: 'Close' }));
    expect(cart).not.toHaveAttribute('open');
  });

  it('asks a visitor with an empty cart to add something before checking out', () => {
    renderWith(<Checkout />);
    expect(screen.getByText(/Your cart is empty\. Add four-packs or gear above/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Place pickup order' })).toBeNull();
  });
});

describe('checkout', () => {
  it('needs an age confirmation when the order holds beer, and names every problem', async () => {
    const user = userEvent.setup();
    saveCart([{ id: 'harbor-lights-4', quantity: 1 }]);
    renderWith(<Checkout />);
    await user.click(await screen.findByRole('button', { name: 'Place pickup order' }));
    expect(screen.getByLabelText('Name for the order')).toHaveFocus();
    expect(screen.getByLabelText('Phone')).toHaveAccessibleDescription('Error: Please enter a phone number we can call at pickup.');
    expect(screen.getByRole('checkbox', { name: /I’m 21 or older/ })).toHaveAccessibleDescription(
      'Error: Beer can only be collected by someone 21 or older.',
    );
  });

  it('asks no age question for an order of gear alone', async () => {
    saveCart([{ id: 'camp-mug', quantity: 1 }]);
    renderWith(<Checkout />);
    await screen.findByRole('button', { name: 'Place pickup order' });
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('says plainly that nothing was sent when no endpoint is set, and keeps the cart', async () => {
    const user = userEvent.setup();
    saveCart([{ id: 'harbor-lights-4', quantity: 2 }]);
    renderWith(<Checkout />);
    await user.type(await screen.findByLabelText('Name for the order'), 'Sam Rivera');
    await user.type(screen.getByLabelText('Email'), 'sam@example.com');
    await user.type(screen.getByLabelText('Phone'), '555 010 2233');
    await user.click(screen.getByRole('checkbox', { name: /I’m 21 or older/ }));
    await user.click(screen.getByRole('button', { name: 'Place pickup order' }));
    expect(await screen.findByRole('heading', { name: 'Nothing was sent.' })).toHaveFocus();
    expect(screen.getByText(/Your order is held\. Pick up at the taproom bar\./)).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]')).toEqual([{ id: 'harbor-lights-4', quantity: 2 }]);
  });

  it('posts the order with its items and total, then empties the cart', async () => {
    const user = userEvent.setup();
    const sender = fakeSender('sent');
    saveCart([
      { id: 'harbor-lights-4', quantity: 2 },
      { id: 'work-cap', quantity: 1 },
    ]);
    renderWith(<Checkout sender={sender} />);
    await user.type(await screen.findByLabelText('Name for the order'), 'Sam Rivera');
    await user.type(screen.getByLabelText('Email'), 'sam@example.com');
    await user.type(screen.getByLabelText('Phone'), '555 010 2233');
    await user.click(screen.getByRole('radio', { name: 'Curbside: call when you arrive' }));
    await user.click(screen.getByRole('checkbox', { name: /I’m 21 or older/ }));
    await user.click(screen.getByRole('button', { name: 'Place pickup order' }));
    expect(sender.send).toHaveBeenCalledWith({
      name: 'Sam Rivera',
      email: 'sam@example.com',
      phone: '555 010 2233',
      pickup: 'Curbside: call when you arrive',
      notes: '',
      ageConfirmed: true,
      items: [
        { id: 'harbor-lights-4', name: 'Harbor Lights IPA', quantity: 2, price: 16 },
        { id: 'work-cap', name: 'Work Cap', quantity: 1, price: 28 },
      ],
      total: 60,
    });
    expect(await screen.findByRole('heading', { name: /Your order is held\. Curbside/ })).toHaveFocus();
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]')).toEqual([]);
  });

  it('keeps the order and explains when it fails', async () => {
    const user = userEvent.setup();
    saveCart([{ id: 'work-cap', quantity: 1 }]);
    renderWith(<Checkout sender={fakeSender('failed')} />);
    await user.type(await screen.findByLabelText('Name for the order'), 'Sam Rivera');
    await user.type(screen.getByLabelText('Email'), 'sam@example.com');
    await user.type(screen.getByLabelText('Phone'), '555 010 2233');
    await user.click(screen.getByRole('button', { name: 'Place pickup order' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong on our side.');
    expect(screen.getByLabelText('Name for the order')).toHaveValue('Sam Rivera');
  });
});

describe('the Can Club sign-up', () => {
  it('lives on the contact page at the address the Can Club buttons use', () => {
    renderSite('/contact');
    expect(screen.getByRole('region', { name: 'Join the Can Club' })).toHaveAttribute('id', 'can-club');
  });

  it('needs a name, an email and an age confirmation, and asks for no password', async () => {
    const user = userEvent.setup();
    const { container } = renderWith(<CanClubSignup />);
    expect(container.querySelector('input[type="password"]')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Join the Can Club' }));
    expect(screen.getByLabelText('Name')).toHaveFocus();
    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription('Error: Can Club members must be 21 or older.');
  });

  it('says plainly that nothing was sent when no endpoint is set', async () => {
    const user = userEvent.setup();
    renderWith(<CanClubSignup />);
    await user.click(screen.getByRole('radio', { name: /Quarterly/ }));
    await user.type(screen.getByLabelText('Name'), 'Aisha Khan');
    await user.type(screen.getByLabelText('Email'), 'aisha@example.com');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Join the Can Club' }));
    expect(await screen.findByRole('heading', { name: 'Nothing was sent.' })).toHaveFocus();
    expect(screen.getByText(/You’re in: Quarterly, 12 cans every three months for \$54\./)).toBeInTheDocument();
  });

  it('posts the sign-up with the plan and its price', async () => {
    const user = userEvent.setup();
    const sender = fakeSender('sent');
    renderWith(<CanClubSignup sender={sender} />);
    await user.type(screen.getByLabelText('Name'), 'Aisha Khan');
    await user.type(screen.getByLabelText('Email'), 'aisha@example.com');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Join the Can Club' }));
    expect(sender.send).toHaveBeenCalledWith({
      name: 'Aisha Khan',
      email: 'aisha@example.com',
      plan: 'Monthly',
      price: 20,
      ageConfirmed: true,
    });
    expect(await screen.findByRole('heading', { name: /You’re in: Monthly/ })).toHaveFocus();
  });
});
